import React, { useState } from 'react'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as ccStrings } from '../lang/create-agency'
import * as AgencyService from '../services/AgencyService'
import * as UserService from '../services/UserService'
import * as Helper from '../common/Helper'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Avatar from '../components/Avatar'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Link,
  FormControlLabel,
  Switch
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import validator from 'validator'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'

import '../assets/css/update-agency.css'

const UpdateAgency = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [agency, setAgency] = useState<movininTypes.User>()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullNameError, setFullNameError] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [email, setEmail] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [payLater, setPayLater] = useState(true)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)

    if (!e.target.value) {
      setFullNameError(false)
    }
  }

  const validateFullName = async (fullName: string) => {
    if (agency && fullName) {
      if (agency.fullName !== fullName) {
        try {
          const status = await AgencyService.validate({ fullName })

          if (status === 200) {
            setFullNameError(false)
            return true
          } else {
            setFullNameError(true)
            setAvatarError(false)
            setError(false)
            return false
          }
        } catch (err) {
          Helper.error(err)
        }
      } else {
        setFullNameError(false)
        setAvatarError(false)
        setError(false)
        return true
      }
    } else {
      setFullNameError(true)
      setAvatarError(false)
      setError(false)
      return false
    }
  }

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateFullName(e.target.value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)

    if (!e.target.value) {
      setPhoneValid(true)
    }
  }

  const validatePhone = (phone?: string) => {
    if (phone) {
      const phoneValid = validator.isMobilePhone(phone)
      setPhoneValid(phoneValid)

      return phoneValid
    } else {
      setPhoneValid(true)

      return true
    }
  }

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validatePhone(e.target.value)
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
  }

  const onBeforeUpload = () => {
    setLoading(true)
  }

  const onAvatarChange = (avatar: string) => {
    if (agency && user) {
      const _agency = movininHelper.clone(agency)
      _agency.avatar = avatar

      if (user._id === agency._id) {
        const _user = movininHelper.clone(user)
        _user.avatar = avatar
        setUser(_user)
      }

      setLoading(false)
      setAgency(_agency)

      if (avatar) {
        setAvatarError(false)
      }
    } else {
      Helper.error()
    }
  }

  const handleResendActivationLink = async () => {
    if (agency) {
      try {
        const status = await UserService.resend(agency.email, false, Env.APP_TYPE)

        if (status === 200) {
          Helper.info(commonStrings.ACTIVATION_EMAIL_SENT)
        } else {
          Helper.error()
        }
      } catch (err) {
        Helper.error(err)
      }
    }
  }

  const onLoad = async (user?: movininTypes.User) => {
    if (user && user.verified) {
      setLoading(true)
      setUser(user)

      const params = new URLSearchParams(window.location.search)
      if (params.has('c')) {
        const id = params.get('c')
        if (id && id !== '') {
          try {
            const agency = await AgencyService.getAgency(id)

            if (agency) {
              setAgency(agency)
              setEmail(agency.email || '')
              setAvatar(agency.avatar || '')
              setFullName(agency.fullName || '')
              setPhone(agency.phone || '')
              setLocation(agency.location || '')
              setBio(agency.bio || '')
              setPayLater(agency.payLater || false)
              setVisible(true)
              setLoading(false)
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } catch (err) {
            Helper.error(err)
            setLoading(false)
            setError(true)
            setVisible(false)
          }
        } else {
          setLoading(false)
          setNoMatch(true)
        }
      } else {
        setLoading(false)
        setNoMatch(true)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const fullNameValid = await validateFullName(fullName)
      if (!fullNameValid) {
        return
      }

      const phoneValid = validatePhone(phone)
      if (!phoneValid) {
        return
      }

      if (!avatar) {
        setAvatarError(true)
        setError(false)
        return
      }

      if (!agency) {
        Helper.error()
        return
      }

      const data: movininTypes.UpdateAgencyPayload = {
        _id: agency._id as string,
        fullName,
        phone,
        location,
        bio,
        payLater,
      }

      const status = await AgencyService.update(data)

      if (status === 200) {
        agency.fullName = fullName
        setAgency(movininHelper.clone(agency))
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const admin = Helper.admin(user)

  return (
    <Master onLoad={onLoad} strict user={user}>
      {visible && (
        <div className="update-agency">
          <Paper className="agency-form-update agency-form-wrapper" elevation={10}>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={movininTypes.RecordType.Agency}
                mode="update"
                record={agency}
                size="large"
                readonly={false}
                hideDelete={true}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
              />

              <div className="info">
                <InfoIcon />
                <label>{ccStrings.RECOMMENDED_IMAGE_SIZE}</label>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" error={fullNameError} required onBlur={handleFullNameBlur} onChange={handleFullNameChange} autoComplete="off" value={fullName} />
                <FormHelperText error={fullNameError}>{(fullNameError && ccStrings.INVALID_AGENCY_NAME) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" value={email} disabled />
              </FormControl>

              <FormControl component="fieldset" style={{ marginTop: 15 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={payLater}
                      onChange={(e) => {
                        setPayLater(e.target.checked)
                      }}
                      color="primary"
                    />
                  }
                  label={commonStrings.PAY_LATER}
                />
              </FormControl>

              <div className="info">
                <InfoIcon />
                <label>{commonStrings.OPTIONAL}</label>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.PHONE}</InputLabel>
                <Input id="phone" type="text" onChange={handlePhoneChange} onBlur={handlePhoneBlur} autoComplete="off" value={phone} error={!phoneValid} />
                <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                <Input id="location" type="text" onChange={handleLocationChange} autoComplete="off" value={location} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.BIO}</InputLabel>
                <Input id="bio" type="text" onChange={handleBioChange} autoComplete="off" value={bio} />
              </FormControl>
              {admin && (
                <FormControl fullWidth margin="dense" className="resend-activation-link">
                  <Link onClick={handleResendActivationLink}>{commonStrings.RESEND_ACTIVATION_LINK}</Link>
                </FormControl>
              )}
              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href={`/change-password?u=${agency && agency._id}`}>
                  {commonStrings.RESET_PASSWORD}
                </Button>
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/agencies">
                  {commonStrings.CANCEL}
                </Button>
              </div>

              <div className="form-error">
                {error && <Error message={commonStrings.GENERIC_ERROR} />}
                {avatarError && <Error message={commonStrings.IMAGE_REQUIRED} />}
              </div>
            </form>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {noMatch && <NoMatch hideHeader />}
    </Master>
  )
}

export default UpdateAgency
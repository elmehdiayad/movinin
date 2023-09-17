import React, { useState } from 'react'
import Env from '../config/env.config'
import Master from '../components/Master'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/settings'
import * as UserService from '../services/UserService'
import Backdrop from '../components/SimpleBackdrop'
import DatePicker from '../components/DatePicker'
import Avatar from '../components/Avatar'
import {
  Input,
  InputLabel,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Paper
} from '@mui/material'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import * as Helper from '../common/Helper'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'

import '../assets/css/settings.css'

const Settings = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthDateValid, setBirthDateValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
  }

  const validatePhone = (phone: string) => {
    if (phone) {
      const phoneValid = validator.isMobilePhone(phone)
      setPhoneValid(phoneValid)

      return phoneValid
    } else {
      setPhoneValid(true)

      return true
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)

    if (!e.target.value) {
      setPhoneValid(true)
    }
  }

  const validateBirthDate = (date?: Date) => {
    if (date && movininHelper.isDate(date)) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const birthDateValid = sub >= Env.MINIMUM_AGE

      setBirthDateValid(birthDateValid)
      return birthDateValid
    } else {
      setBirthDateValid(true)
      return true
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
  }

  const handleEmailNotificationsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (user && user._id) {
        setEnableEmailNotifications(e.target.checked)

        user.enableEmailNotifications = e.target.checked

        const payload: movininTypes.UpdateEmailNotificationsPayload = {
          _id: user._id,
          enableEmailNotifications: user.enableEmailNotifications
        }
        const status = await UserService.updateEmailNotifications(payload)

        if (status === 200) {
          setUser(user)
          Helper.info(strings.SETTINGS_UPDATED)
        }
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onBeforeUpload = () => {
    setLoading(true)
  }

  const onAvatarChange = (user: movininTypes.User) => {
    setUser(user)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (!user || !user._id) {
        Helper.error()
        return
      }

      const phoneValid = validatePhone(phone)
      if (!phoneValid) {
        return
      }

      const birthDateValid = validateBirthDate(birthDate)
      if (!birthDateValid) {
        return
      }

      const data: movininTypes.UpdateUserPayload = {
        _id: user._id,
        fullName,
        birthDate,
        phone,
        location,
        bio,
      }

      const status = await UserService.updateUser(data)

      if (status === 200) {
        Helper.info(strings.SETTINGS_UPDATED)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = (user?: movininTypes.User) => {
    if (user) {
      setUser(user)
      setFullName(user.fullName)
      setPhone(user.phone || '')
      setBirthDate(user && user.birthDate ? new Date(user.birthDate) : undefined)
      setLocation(user.location || '')
      setBio(user.bio || '')
      setEnableEmailNotifications(user.enableEmailNotifications ?? true)
      setVisible(true)
      setLoading(false)
    }
  }

  return (
    <Master onLoad={onLoad} user={user} strict>
      {visible && user && (
        <div className="settings">
          <Paper className="settings-form settings-form-wrapper" elevation={10}>
            <form onSubmit={handleSubmit}>
              <Avatar
                loggedUser={user}
                user={user}
                size="large"
                readonly={false}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" required onChange={handleFullNameChange} autoComplete="off" value={fullName} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" value={user.email} disabled />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
                <Input id="phone" type="text" required error={!phoneValid} onChange={handlePhoneChange} autoComplete="off" value={phone} />
                <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <DatePicker
                  label={commonStrings.BIRTH_DATE}
                  value={birthDate}
                  variant="standard"
                  required
                  onChange={(birthDate) => {
                    const birthDateValid = validateBirthDate(birthDate)

                    setBirthDate(birthDate)
                    setBirthDateValid(birthDateValid)
                  }}
                  language={user.language}
                />
                <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                <Input id="location" type="text" onChange={handleLocationChange} autoComplete="off" value={location} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.BIO}</InputLabel>
                <Input id="bio" type="text" onChange={handleBioChange} autoComplete="off" value={bio} />
              </FormControl>
              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href="/change-password">
                  {commonStrings.RESET_PASSWORD}
                </Button>
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/">
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>
          </Paper>
          <Paper className="settings-net settings-net-wrapper" elevation={10}>
            <h1 className="settings-form-title"> {strings.NETWORK_SETTINGS} </h1>
            <FormControl component="fieldset">
              <FormControlLabel control={<Switch checked={enableEmailNotifications} onChange={handleEmailNotificationsChange} />} label={strings.SETTINGS_EMAIL_NOTIFICATIONS} />
            </FormControl>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Master>
  )
}

export default Settings

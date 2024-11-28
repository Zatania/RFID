// ** React Imports
import { Ref, useState, forwardRef, ReactElement, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import Fade, { FadeProps } from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import EditIcon from '@mui/icons-material/Edit'
import ViewIcon from '@mui/icons-material/Visibility'
import OutlinedInput from '@mui/material/OutlinedInput'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import { FormControlLabel, FormGroup, Checkbox } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import Card from '@mui/material/Card'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import dayjs from 'dayjs'
import * as bcrypt from 'bcryptjs'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogEditProfile = ({ user, fetchUser }) => {
  const [show, setShow] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  })

  const handleClose = () => {
    setShow(false)
    reset()
    fetchUser()
  }

  const onSubmit = async data => {
    try {
      const response = await fetch(`/api/user/profile/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit form')
      }

      toast.success('User Information Updated Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  useEffect(() => {
    if (user) {
      setValue('last_name', user?.user_info?.last_name)
      setValue('first_name', user?.user_info?.first_name)
      setValue('middle_name', user?.user_info?.middle_name)
      setValue('username', user?.user_info?.username)
    }
  }, [setValue, user])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Button size='small' startIcon={<EditIcon />} variant='outlined' onClick={() => setShow(true)}>
          Edit Profile
        </Button>
        <Dialog
          fullWidth
          open={show}
          maxWidth='md'
          scroll='body'
          onClose={handleClose}
          TransitionComponent={Transition}
          onBackdropClick={handleClose}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent
              sx={{
                position: 'relative',
                pb: theme => `${theme.spacing(8)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                <Icon icon='mdi:close' />
              </IconButton>
              <Box sx={{ mb: 8, textAlign: 'center' }}>
                <Typography variant='h5' sx={{ mb: 3 }}>
                  Edit User
                </Typography>
                <Typography variant='body2'>Edit User Information</Typography>
                {user?.user_info?.status !== 'Active' && (
                  <Typography variant='body2' sx={{ color: 'error.main', mt: 2 }}>
                    Note: You cannot edit user information because the account is not yet activated.
                  </Typography>
                )}
              </Box>
              <Grid container spacing={6}>
                <Grid item sm={12} xs={12}>
                  <Typography variant='body1'>User Information</Typography>
                </Grid>
                <Grid item sm={4} xs={12}>
                  <Controller
                    name='last_name'
                    control={control}
                    rules={{
                      required: user?.user_info?.status === 'Active' ? 'This field is required' : false
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Last Name'
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        InputProps={{
                          readOnly: user?.user_info?.status !== 'Active'
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item sm={4} xs={12}>
                  <Controller
                    name='first_name'
                    control={control}
                    rules={{
                      required: user?.user_info?.status === 'Active' ? 'This field is required' : false
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='First Name'
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        InputProps={{
                          readOnly: user?.user_info?.status !== 'Active'
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item sm={4} xs={12}>
                  <Controller
                    name='middle_name'
                    control={control}
                    rules={{
                      required: user?.user_info?.status === 'Active' ? 'This field is required' : false
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Middle Name'
                        error={!!errors.middle_name}
                        helperText={errors.middle_name?.message}
                        InputProps={{
                          readOnly: user?.user_info?.status !== 'Active'
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item sm={12} xs={12}>
                  <Typography variant='body1'>Account Information</Typography>
                </Grid>
                <Grid item sm={4} xs={12}>
                  <Controller
                    name='username'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Username'
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        InputProps={{ readOnly: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item sm={12} xs={12}>
                  <Typography variant='body1'>Change Account Password</Typography>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel htmlFor='current_password' error={Boolean(errors.current_password)}>
                      Current Password
                    </InputLabel>
                    <Controller
                      name='current_password'
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <OutlinedInput
                          value={value}
                          onBlur={onBlur}
                          label='Current Password'
                          onChange={onChange}
                          id='current_password'
                          error={Boolean(errors.current_password)}
                          type={showCurrentPassword ? 'text' : 'password'}
                          disabled={user?.user_info?.status !== 'Active'}
                          endAdornment={
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                <Icon
                                  icon={showCurrentPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}
                                  fontSize={20}
                                />
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      )}
                    />
                    {errors.current_password && (
                      <FormHelperText sx={{ color: 'error.main' }} id=''>
                        {errors.current_password.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel htmlFor='new_password' error={Boolean(errors.new_password)}>
                      New Password
                    </InputLabel>
                    <Controller
                      name='new_password'
                      control={control}
                      rules={{
                        validate: value =>
                          (!value && !getValues('current_password')) ||
                          (!!getValues('current_password') && !!value) ||
                          'New Password is required when changing Current Password'
                      }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <OutlinedInput
                          value={value}
                          onBlur={onBlur}
                          label='New Password'
                          onChange={onChange}
                          id='new_password'
                          error={Boolean(errors.new_password)}
                          type={showNewPassword ? 'text' : 'password'}
                          disabled={user?.user_info?.status !== 'Active'}
                          endAdornment={
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                <Icon
                                  icon={showNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}
                                  fontSize={20}
                                />
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      )}
                    />
                    {errors.new_password && (
                      <FormHelperText sx={{ color: 'error.main' }} id=''>
                        {errors.new_password.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: 'center',
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => handleClose()}>
                Close
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}

export default DialogEditProfile

import { useState, forwardRef, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import EditIcon from '@mui/icons-material/Edit'
import FormControl from '@mui/material/FormControl'
import Input from '@mui/material/Input'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as bcrypt from 'bcryptjs'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogAddPremium = ({ refreshData }) => {
  const [show, setShow] = useState(false)
  const [rfidScanning, setRfidScanning] = useState(false)
  const [rfid, setRfid] = useState('')
  const rfidRef = useRef()
  const [premiumImageUploaded, setPremiumImageUploaded] = useState(false)
  const [premiumImagePath, setPremiumImagePath] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  })

  const handleClose = () => {
    setShow(false)
    reset()
    refreshData()
    setRfid('')
    setRfidScanning(false)
    setPremiumImageUploaded(false)
    setPremiumImagePath('')
  }

  useEffect(() => {
    if (show && rfidRef.current) {
      const serverIp = process.env.NEXT_PUBLIC_SERVER_IP
      const socket = new WebSocket(`ws://${serverIp}:4000/user`)

      console.log('Connecting to websocket server in adding premium user...')

      socket.addEventListener('message', event => {
        const message = event.data

        if (rfidScanning) {
          setRfid(message)
          setValue('rfid', message)
          setRfidScanning(false)
        }
      })

      return () => {
        socket.close()
      }
    }
  }, [show, rfidScanning, setValue])

  const handleUpdateRfid = () => {
    setRfidScanning(true)
  }

  const handleImageUpload = async file => {
    if (!file) return ''

    const formData = new FormData()
    formData.append('myImage', file)

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Image uploaded successfully')

      return response.data.imagePath
    } catch (error) {
      console.error(error)
      if (error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to upload image')
      }

      return ''
    }
  }

  const onSubmit = async data => {
    const password = data.password

    const hashedPassword = await bcrypt.hash(password, 10)

    data.password = hashedPassword

    const imagePath = premiumImagePath || 'default.png'

    const formData = {
      ...data,
      image: imagePath
    }
    try {
      const response = await fetch('/api/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit form')
      }

      toast.success('Premium User Added Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Button
        size='small'
        onClick={() => setShow(true)}
        startIcon={<AddIcon />}
        variant='outlined'
        style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
      >
        Add Premium User
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
                Add Premium User
              </Typography>
              <Typography variant='body2'>Fill Premium User Information</Typography>
            </Box>
            <Grid container spacing={6}>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Premium User Information</Typography>
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='last_name'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Last Name'
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='first_name'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='First Name'
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='middle_name'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Middle Name'
                      error={!!errors.middle_name}
                      helperText={errors.middle_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='phone_number'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Phone Number (09xxxxxxxxx)'
                      error={!!errors.phone_number}
                      helperText={errors.phone_number?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='email_address'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Email Address'
                      error={!!errors.email_address}
                      helperText={errors.email_address?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={8} xs={12}>
                <Controller
                  name='address'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Address'
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='rfid'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='RFID Number'
                      error={!!errors.rfid}
                      helperText={errors.rfid?.message}
                      inputRef={rfidRef}
                      value={rfid}
                      onChange={e => {
                        setRfid(e.target.value)
                        setValue('rfid', e.target.value)
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            {rfidScanning ? (
                              <CircularProgress size={24} />
                            ) : (
                              <Button
                                size='small'
                                startIcon={<EditIcon />}
                                onClick={() => handleUpdateRfid()}
                                variant='text'
                              >
                                Change
                              </Button>
                            )}
                          </InputAdornment>
                        )
                      }}
                      disabled
                    />
                  )}
                />
              </Grid>
              <Grid item sm={12} xs={12}>
                <Grid
                  container
                  spacing={6}
                  sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
                  <Grid item sm={12} xs={12}>
                    <Typography variant='body1'>Upload Premium User Profile Image</Typography>
                  </Grid>
                  <Grid item sm={12} xs={12}>
                    <FormControl>
                      <Input
                        type='file'
                        id='premium-image-upload'
                        style={{ display: 'none' }}
                        onChange={async ({ target }) => {
                          if (target.files && target.files.length > 0) {
                            const file = target.files[0]
                            const imagePath = await handleImageUpload(file)
                            if (imagePath) {
                              setPremiumImageUploaded(true)
                              setPremiumImagePath(imagePath)
                            }
                          }
                        }}
                      />
                      {premiumImageUploaded ? (
                        <>
                          <img
                            src={`/api/image/${premiumImagePath}`}
                            alt='Premium User Profile Picture'
                            style={{ maxWidth: '50%' }}
                          />
                          <Typography>Premium Profile Image Successfully Uploaded</Typography>
                        </>
                      ) : (
                        <Button
                          variant='outlined'
                          component='label'
                          htmlFor='premium-image-upload'
                          className='w-40 aspect-video rounded border-2 border-dashed cursor-pointer'
                        >
                          Select Image
                        </Button>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Driver's License Information</Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='license_number'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='License Number'
                      error={!!errors.license_number}
                      helperText={errors.license_number?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='expiration'
                    control={control}
                    render={({ field }) => <DatePicker label='Expiration Date' {...field} />}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Account Information</Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='username'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Username'
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel htmlFor='password' error={Boolean(errors.password)}>
                    Password
                  </InputLabel>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <OutlinedInput
                        value={value}
                        onBlur={onBlur}
                        label='Password'
                        onChange={onChange}
                        id='password'
                        error={Boolean(errors.password)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    )}
                  />
                  {errors.password && (
                    <FormHelperText sx={{ color: 'error.main' }} id=''>
                      {errors.password.message}
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
            <Button variant='contained' sx={{ mr: 1 }} type='submit'>
              Submit
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  )
}

export default DialogAddPremium

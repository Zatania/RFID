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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import dayjs from 'dayjs'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogViewPremium = ({ premium, refreshData }) => {
  const [show, setShow] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [premiumImageUploaded, setPremiumImageUploaded] = useState(false)
  const [premiumImagePath, setPremiumImagePath] = useState('')
  const [premiumImage, setPremiumImage] = useState('')
  const [premiumID, setPremiumID] = useState('')
  const [rfidScanning, setRfidScanning] = useState(false)
  const [rfid, setRfid] = useState('')
  const rfidRef = useRef()

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
    setPremiumImageUploaded(false)
    setPremiumImagePath('')
    setPremiumImage('')
    setPremiumID('')
    setRfid('')
    setIsEditing(false)
    setRfidScanning(false)
  }

  useEffect(() => {
    if (show && rfidRef.current) {
      const socket = new WebSocket('ws://localhost:4000')

      console.log('Connecting to websocket server in editing premium user...')

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
    const imagePath = premiumImagePath || 'default.png'

    const formData = {
      ...data,
      premium_id: premiumID,
      image: imagePath
    }
    try {
      const response = await fetch('/api/premium', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit form')
      }

      toast.success('Premium User Information Edited Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  useEffect(() => {
    if (premium) {
      setPremiumID(premium.id)
      setValue('last_name', premium.last_name)
      setValue('first_name', premium.first_name)
      setValue('middle_name', premium.middle_name)
      setValue('email', premium.email)
      setValue('phone_number', premium.phone_number)
      setValue('email_address', premium.email_address)
      setValue('address', premium.address)
      setValue('rfid', premium.rfid)
      setValue('license_number', premium.license_number)
      setValue('expiration', premium.expiration)
      setPremiumImagePath(premium.image)
      setPremiumImage(premium.image)
      if (premium && premium.rfid) {
        setRfid(premium.rfid)
        setValue('rfid', premium.rfid)
      } else {
        setRfid('')
      }
    }
  }, [setValue, premium])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Button size='small' sx={{ mr: 3 }} startIcon={<ViewIcon />} variant='outlined' onClick={() => setShow(true)}>
        View Info
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
                {isEditing ? 'Edit Premium User' : 'View Premium User'}
              </Typography>
              <Typography variant='body2'>
                {isEditing ? 'Edit Premium User Information' : 'View Premium User Information'}
              </Typography>
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
                      InputProps={{ readOnly: !isEditing }}
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
                      InputProps={{ readOnly: !isEditing }}
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
                      InputProps={{ readOnly: !isEditing }}
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
                      InputProps={{ readOnly: !isEditing }}
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
                      InputProps={{ readOnly: !isEditing }}
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
                      InputProps={{ readOnly: !isEditing }}
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
                        readOnly: true,
                        endAdornment: isEditing ? (
                          <InputAdornment position='end'>
                            {rfidScanning ? (
                              <CircularProgress size={24} />
                            ) : (
                              <Button
                                size='small'
                                startIcon={<EditIcon />}
                                onClick={() => handleUpdateRfid()}
                                disabled={!isEditing}
                                variant='text'
                              >
                                Change
                              </Button>
                            )}
                          </InputAdornment>
                        ) : null
                      }}
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
                    <Typography variant='body1'>Premium User Image</Typography>
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
                      {premiumImage ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {premiumImageUploaded ? (
                            <>
                              <img
                                src={`/api/image/${premiumImagePath}`}
                                alt='Premium User Profile Picture'
                                style={{ maxWidth: '50%' }}
                              />
                              <Typography>Premium User Image Successfully Uploaded</Typography>
                            </>
                          ) : (
                            <>
                              <img
                                src={`/api/image/${premiumImage}`}
                                alt='Premium User Profile Picture'
                                style={{ maxWidth: '50%' }}
                              />
                              {isEditing && (
                                <Button
                                  variant='outlined'
                                  component='label'
                                  htmlFor='premium-image-upload'
                                  sx={{ mt: 2 }}
                                >
                                  Change Image
                                </Button>
                              )}
                            </>
                          )}
                        </Box>
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
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='expiration'
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label='Expiration Date'
                        value={field.value ? dayjs(field.value) : null}
                        onChange={field.onChange}
                        readOnly={!isEditing}
                        renderInput={params => <TextField {...params} />}
                      />
                    )}
                  />
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
            {isEditing ? (
              <>
                <Button type='submit' variant='contained'>
                  Save
                </Button>
                <Button variant='outlined' color='secondary' onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='contained'
                  onClick={e => {
                    e.preventDefault()
                    setIsEditing(true)
                  }}
                >
                  Edit
                </Button>
                <Button variant='outlined' color='secondary' onClick={handleClose}>
                  Close
                </Button>
              </>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  )
}

export default DialogViewPremium

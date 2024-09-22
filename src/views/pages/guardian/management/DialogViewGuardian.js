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

const DialogViewGuardian = ({ guardian, users, refreshData }) => {
  const [show, setShow] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [guardianImageUploaded, setGuardianImageUploaded] = useState(false)
  const [guardianImagePath, setGuardianImagePath] = useState('')
  const [guardianImage, setGuardianImage] = useState('')
  const [guardianID, setGuardianID] = useState('')
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
    setGuardianImageUploaded(false)
    setGuardianImagePath('')
    setGuardianImage('')
    setGuardianID('')
    setRfid('')
    setIsEditing(false)
    setRfidScanning(false)
  }

  useEffect(() => {
    if (show && rfidRef.current) {
      const socket = new WebSocket('ws://localhost:4000')

      console.log('Connecting to websocket server in editing guardian...')

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

      if (guardianImage && guardianImage !== 'default.png') {
        await axios.delete(`/api/image/${guardianImage}`)
      }

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
    const imagePath = guardianImagePath || 'default.png'

    const formData = {
      ...data,
      guardian_id: guardianID,
      image: imagePath
    }
    try {
      const response = await fetch('/api/guardian', {
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

      toast.success('Guardian Information Edited Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  useEffect(() => {
    if (guardian) {
      setGuardianID(guardian.id)
      setValue('last_name', guardian.last_name)
      setValue('first_name', guardian.first_name)
      setValue('middle_name', guardian.middle_name)
      setValue('email', guardian.email)
      setValue('phone_number', guardian.phone_number)
      setValue('email_address', guardian.email_address)
      setValue('address', guardian.address)
      setValue('rfid', guardian.rfid)
      setValue('user_id', guardian.user_id)
      setValue('license_number', guardian.license_number)
      setValue('expiration', guardian.expiration)
      setGuardianImagePath(guardian.image)
      setGuardianImage(guardian.image)
      if (guardian && guardian.rfid) {
        setRfid(guardian.rfid)
        setValue('rfid', guardian.rfid)
      } else {
        setRfid('')
      }
    }
  }, [setValue, guardian])

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
                {isEditing ? 'Edit Guardian' : 'View Guardian'}
              </Typography>
              <Typography variant='body2'>
                {isEditing ? 'Edit Guardian Information' : 'View Guardian Information'}
              </Typography>
            </Box>
            <Grid container spacing={6}>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Guardian Information</Typography>
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
              <Grid item sm={5} xs={12}>
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
              <Grid item sm={4} xs={12}>
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
              <Grid item sm={3} xs={12}>
                <FormControl fullWidth error={!!errors.user_id}>
                  <InputLabel htmlFor='student-select'>Student</InputLabel>
                  <Controller
                    name='user_id'
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => (
                      <Select
                        id='student-select'
                        label='Student'
                        {...field}
                        disabled={!isEditing}
                        onChange={e => {
                          field.onChange(e)
                        }}
                      >
                        {users &&
                          users
                            .filter(user => user.type === 'Student')
                            .map(user => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                              </MenuItem>
                            ))}
                      </Select>
                    )}
                  />
                  {errors.user_id && <FormHelperText>{errors.user_id.message}</FormHelperText>}
                </FormControl>
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
                    <Typography variant='body1'>User Image</Typography>
                  </Grid>
                  <Grid item sm={12} xs={12}>
                    <FormControl>
                      <Input
                        type='file'
                        id='user-image-upload'
                        style={{ display: 'none' }}
                        onChange={async ({ target }) => {
                          if (target.files && target.files.length > 0) {
                            const file = target.files[0]
                            const imagePath = await handleImageUpload(file)
                            if (imagePath) {
                              setGuardianImageUploaded(true)
                              setGuardianImagePath(imagePath)
                            }
                          }
                        }}
                      />
                      {guardianImage ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {guardianImageUploaded ? (
                            <>
                              <img
                                src={`/api/image/${guardianImagePath}`}
                                alt='User Profile Picture'
                                style={{ maxWidth: '50%' }}
                              />
                              <Typography>User Image Successfully Uploaded</Typography>
                            </>
                          ) : (
                            <>
                              <img
                                src={`/api/image/${guardianImage}`}
                                alt='User Profile Picture'
                                style={{ maxWidth: '50%' }}
                              />
                              {isEditing && (
                                <Button variant='outlined' component='label' htmlFor='user-image-upload' sx={{ mt: 2 }}>
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
                          htmlFor='user-image-upload'
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
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => {
                    setIsEditing(false)
                    setRfidScanning(false)
                  }}
                >
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

export default DialogViewGuardian

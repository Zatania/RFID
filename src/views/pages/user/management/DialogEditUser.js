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
import OutlinedInput from '@mui/material/OutlinedInput'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import { FormControlLabel, FormGroup, Checkbox } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogEditUser = ({ user, refreshData }) => {
  const [show, setShow] = useState(false)
  const [userImageUploaded, setUserImageUploaded] = useState(false)
  const [vehicleImageUploaded, setVehicleImageUploaded] = useState(false)
  const [userImagePath, setUserImagePath] = useState('')
  const [vehicleImagePath, setVehicleImagePath] = useState('')
  const [userImage, setUserImage] = useState('')
  const [vehicleImage, setVehicleImage] = useState('')
  const [userID, setUserID] = useState('')
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
    setUserImageUploaded(false)
    setVehicleImageUploaded(false)
    setUserImagePath('')
    setVehicleImagePath('')
    setUserImage('')
    setVehicleImage('')
    setUserID('')
    setRfid('')
  }

  useEffect(() => {
    if (show && rfidRef.current) {
      const socket = new WebSocket('ws://localhost:4000')

      console.log('Connecting to websocket server in editing user...')

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
    const formData = {
      ...data,
      user_id: userID,
      image: userImagePath,
      vehicle_image: vehicleImagePath
    }
    try {
      const response = await fetch('/api/user', {
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

      toast.success('User Information Edited Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  useEffect(() => {
    if (user) {
      setUserID(user.user_id)
      setValue('last_name', user.last_name)
      setValue('first_name', user.first_name)
      setValue('middle_name', user.middle_name)
      setValue('phone', user.phone)
      setValue('address', user.address)
      setUserImagePath(user.image)
      setUserImage(user.image)
      setValue('vehicle_maker', user.vehicle_maker)
      setValue('vehicle_model', user.vehicle_model)
      setValue('vehicle_color', user.vehicle_color)
      setValue('vehicle_plate_number', user.vehicle_plate_number)
      setVehicleImage(user.vehicle_image)
      setVehicleImagePath(user.vehicle_image)

      if (user && user.rfid) {
        setRfid(user.rfid)
        setValue('rfid', user.rfid)
      } else {
        setRfid('')
      }
    }
  }, [setValue, user])

  return (
    <>
      <Button size='small' startIcon={<EditIcon />} onClick={() => setShow(true)} variant='outlined' sx={{ mr: 5 }}>
        Edit
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
              <Typography variant='body2'>Fill User Information</Typography>
            </Box>
            <Grid container spacing={6}>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>User Information</Typography>
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
                  name='phone'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Phone Number'
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
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
                              setUserImageUploaded(true)
                              setUserImagePath(imagePath)
                            }
                          }
                        }}
                      />
                      {userImage ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {userImageUploaded ? (
                            <>
                              <img src={`/api/image/${userImagePath}`} alt='User' style={{ maxWidth: '50%' }} />
                              <Typography>New User Image Successfully Uploaded</Typography>
                            </>
                          ) : (
                            <>
                              <img src={`/api/image/${userImage}`} alt='User' style={{ maxWidth: '50%' }} />
                              <Button variant='outlined' component='label' htmlFor='user-image-upload' sx={{ mt: 2 }}>
                                Change Image
                              </Button>
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
                <Typography variant='body1'>Vehicle Information</Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='vehicle_maker'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Vehicle Maker'
                      error={!!errors.vehicle_maker}
                      helperText={errors.vehicle_maker?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='vehicle_model'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Vehicle Model'
                      error={!!errors.vehicle_model}
                      helperText={errors.vehicle_model?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='vehicle_color'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Vehicle Color'
                      error={!!errors.vehicle_color}
                      helperText={errors.vehicle_color?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='vehicle_plate_number'
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Vehicle Plate Number'
                      error={!!errors.vehicle_plate_number}
                      helperText={errors.vehicle_plate_number?.message}
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
                    <Typography variant='body1'>Vehicle Image</Typography>
                  </Grid>
                  <Grid item sm={12} xs={12}>
                    <FormControl>
                      <Input
                        type='file'
                        id='vehicle-image-upload'
                        style={{ display: 'none' }}
                        onChange={async ({ target }) => {
                          if (target.files && target.files.length > 0) {
                            const file = target.files[0]
                            const imagePath = await handleImageUpload(file)
                            if (imagePath) {
                              setVehicleImageUploaded(true)
                              setVehicleImagePath(imagePath)
                            }
                          }
                        }}
                      />
                      {vehicleImage ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {vehicleImageUploaded ? (
                            <>
                              <img src={`/api/image/${vehicleImagePath}`} alt='Vehicle' style={{ maxWidth: '50%' }} />
                              <Typography>Vehicle Image Successfully Uploaded</Typography>
                            </>
                          ) : (
                            <>
                              <img src={`/api/image/${vehicleImage}`} alt='Vehicle' style={{ maxWidth: '50%' }} />
                              <Button
                                variant='outlined'
                                component='label'
                                htmlFor='vehicle-image-upload'
                                sx={{ mt: 2 }}
                              >
                                Change Image
                              </Button>
                            </>
                          )}
                        </Box>
                      ) : (
                        <Button
                          variant='outlined'
                          component='label'
                          htmlFor='vehicle-image-upload'
                          className='w-40 aspect-video rounded border-2 border-dashed cursor-pointer'
                        >
                          Select Image
                        </Button>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
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
    </>
  )
}

export default DialogEditUser

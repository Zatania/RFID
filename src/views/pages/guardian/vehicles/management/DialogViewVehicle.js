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

const DialogViewVehicle = ({ vehicle, refreshData }) => {
  const [show, setShow] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [vehicleImageUploaded, setVehicleImageUploaded] = useState(false)
  const [vehicleImagePath, setVehicleImagePath] = useState('')
  const [vehicleImage, setVehicleImage] = useState('')
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
    setVehicleImageUploaded(false)
    setVehicleImagePath('')
    setVehicleImage('')
    setRfid('')
    setIsEditing(false)
    setRfidScanning(false)
  }

  useEffect(() => {
    if (show && rfidRef.current) {
      const socket = new WebSocket('ws://localhost:4000/vehicle')

      console.log('Connecting to websocket server in editing vehicle...')

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

      if (vehicleImage && vehicleImage !== 'default.png') {
        await axios.delete(`/api/image/${vehicleImage}`)
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
    const imagePath = vehicleImagePath || 'default.png'

    const formData = {
      ...data,
      vehicle_id: vehicle.id,
      image: imagePath
    }
    try {
      const response = await axios.put(`/api/guardian/vehicle`, { formData })
      if (response.status === 200) {
        toast.success('Vehicle Information Edited Successfully')
      }
      handleClose()
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to update vehicle information')
      }
    }
  }

  useEffect(() => {
    if (vehicle) {
      setValue('maker', vehicle.maker)
      setValue('model', vehicle.model)
      setValue('color', vehicle.color)
      setValue('plate_number', vehicle.plate_number)
      setValue('rfid', vehicle.rfid)
      setValue('or_number', vehicle.or_number)
      setValue('cr_number', vehicle.cr_number)
      setValue('registration_expiration', vehicle.registration_expiration)
      setVehicleImagePath(vehicle.image)
      setVehicleImage(vehicle.image)
      if (vehicle && vehicle.rfid) {
        setRfid(vehicle.rfid)
        setValue('rfid', vehicle.rfid)
      } else {
        setRfid('')
      }
    }
  }, [setValue, vehicle])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Button size='small' sx={{ mr: 3 }} startIcon={<ViewIcon />} variant='outlined' onClick={() => setShow(true)}>
        View
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
                View Vehicle
              </Typography>
              <Typography variant='body2'>View Vehicle Information</Typography>
            </Box>
            <Grid container spacing={6}>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Vehicle Image</Typography>
              </Grid>
              <Grid item sm={12} xs={12}>
                <Grid
                  container
                  spacing={6}
                  sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
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
                              <img
                                src={`/api/image/${vehicleImagePath}`}
                                alt='Vehicle Image'
                                style={{ maxWidth: '50%' }}
                              />
                              <Typography>Vehicle Image Successfully Uploaded</Typography>
                            </>
                          ) : (
                            <>
                              <img src={`/api/image/${vehicleImage}`} alt='Vehicle Image' style={{ maxWidth: '50%' }} />
                              {isEditing && (
                                <Button
                                  variant='outlined'
                                  component='label'
                                  htmlFor='vehicle-image-upload'
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
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Vehicle Information</Typography>
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='maker'
                  control={control}
                  rules={{ required: !isEditing ? false : 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Maker'
                      error={!!errors.maker}
                      helperText={errors.maker?.message}
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='model'
                  control={control}
                  rules={{ required: !isEditing ? false : 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Model'
                      error={!!errors.model}
                      helperText={errors.model?.message}
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='color'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Color'
                      error={!!errors.color}
                      helperText={errors.color?.message}
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='plate_number'
                  control={control}
                  rules={{ required: !isEditing ? false : 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Plate Number (ABC-1234)'
                      error={!!errors.plate_number}
                      helperText={errors.plate_number?.message}
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={8} xs={12}>
                <Controller
                  name='rfid'
                  control={control}
                  rules={{ required: !isEditing ? false : 'This field is required' }}
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
                <Typography variant='body1'>Official Receipt and Certifcate of Registration Information</Typography>
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='or_number'
                  control={control}
                  rules={{ required: !isEditing ? false : 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='OR Number'
                      error={!!errors.or_number}
                      helperText={errors.or_number?.message}
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <Controller
                  name='cr_number'
                  control={control}
                  rules={{ required: !isEditing ? false : 'This field is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='CR Number'
                      error={!!errors.cr_number}
                      helperText={errors.cr_number?.message}
                      InputProps={{ readOnly: !isEditing }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='registration_expiration'
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

export default DialogViewVehicle

// ** React Imports
import { useState, forwardRef, useEffect } from 'react'

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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm } from 'react-hook-form'
import axios from 'axios'
import dayjs from 'dayjs'

// ** Views
import DialogViewVehicle from './DialogViewVehicle'
import DialogDeleteVehicle from './DialogDeleteVehicle'
import DialogAddVehicle from './DialogAddVehicle'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogViewVehicles = ({ user_id, refreshData }) => {
  const [show, setShow] = useState(false)
  const [vehicles, setVehicles] = useState([])

  const {
    control,
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
  }

  useEffect(() => {
    if (show) {
      fetchVehicles(user_id)
    }
  }, [show, user_id])

  const fetchVehicles = async user_id => {
    try {
      const response = await axios.get(`/api/user/${user_id}`)
      setVehicles(response.data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Button
        size='small'
        sx={{ mr: 3 }}
        startIcon={<DirectionsCarIcon />}
        variant='outlined'
        onClick={() => setShow(true)}
      >
        View Vehicles
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
            <Typography variant='body2'>View and Manage Vehicle Information</Typography>
          </Box>
          {vehicles.map((vehicle, index) => (
            <Grid container spacing={6} key={vehicle.id}>
              <Grid item sm={12} xs={12}>
                <Typography variant='body1'>Vehicle {index + 1}</Typography>
              </Grid>
              <Grid item sm={3} xs={12}>
                <Grid
                  container
                  spacing={6}
                  sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
                  <Grid item sm={12} xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {vehicle.image ? (
                        <img src={`/api/image/${vehicle.image}`} alt='Vehicle Image' style={{ maxWidth: '50%' }} />
                      ) : (
                        <Typography>No vehicle image uploaded.</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={3} xs={12}>
                <TextField
                  fullWidth
                  label='Plate Number'
                  value={vehicle.plate_number || ''}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>
              <Grid item sm={3} xs={12}>
                <TextField
                  fullWidth
                  label='RFID Number'
                  value={vehicle.rfid || ''}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>
              <Grid item sm={3} xs={12}>
                <TextField
                  fullWidth
                  label='Registration Expiration'
                  value={
                    vehicle.registration_expiration ? dayjs(vehicle.registration_expiration).format('DD/MM/YYYY') : null
                  }
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>
              <Grid item sm={12} xs={12}>
                <Grid
                  container
                  spacing={6}
                  sx={{ justifyContent: 'right', alignItems: 'right', textAlign: 'right', marginTop: 1 }}
                >
                  <DialogViewVehicle vehicle={vehicle} refreshData={() => fetchVehicles(user_id)} />
                  <DialogDeleteVehicle vehicle_id={vehicle.id} refreshData={() => fetchVehicles(user_id)} />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <DialogAddVehicle user_id={user_id} refreshData={() => fetchVehicles(user_id)} />
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default DialogViewVehicles

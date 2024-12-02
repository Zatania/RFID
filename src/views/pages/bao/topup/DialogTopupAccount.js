// ** React Imports
import { useEffect, useState, forwardRef, ReactElement } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade, { FadeProps } from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ViewIcon from '@mui/icons-material/Visibility'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
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

const DialogTopupAccount = ({ account, refreshData }) => {
  // ** States
  const [show, setShow] = useState(false)
  const [id, setId] = useState(null)
  const [accountType, setAccountType] = useState(null)

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
  }

  useEffect(() => {
    if (account) {
      setId(account.id)
      setValue('first_name', account.first_name)
      setValue('middle_name', account.middle_name)
      setValue('last_name', account.last_name)
      setValue('load_balance', account.load_balance)
      setValue('status', account.status)
      setAccountType(account.account_type)
    }
  }, [setValue, account])

  const onSubmit = async data => {
    const formData = {
      ...data,
      id: id,
      account_type: accountType
    }
    try {
      const response = await fetch('/api/bao/topup', {
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

      toast.success('Account Top Up Successful')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  return (
    <Box>
      <Button size='small' startIcon={<ViewIcon />} onClick={() => setShow(true)} variant='outlined'>
        Top Up Account
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
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
              textAlign: 'center'
            }}
          >
            <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
              <Icon icon='mdi:close' />
            </IconButton>
            <Box sx={{ mb: 8, textAlign: 'center' }}>
              <Typography variant='h5' sx={{ mb: 3 }}>
                Top Up Account
              </Typography>
            </Box>
            <Grid container spacing={6}>
              <Grid item sm={12} xs={12}>
                <Grid
                  container
                  spacing={6}
                  sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
                  <Grid item sm={12} xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {account.image ? (
                        <img src={`/api/image/${account.image}`} alt='Account Image' style={{ maxWidth: '25%' }} />
                      ) : (
                        <Typography>No account image uploaded.</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
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
                      inputProps={{ readOnly: true }}
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
                      inputProps={{ readOnly: true }}
                    />
                  )}
                />
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
                      inputProps={{ readOnly: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='load_balance'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Load Balance'
                      error={!!errors.load_balance}
                      helperText={errors.load_balance?.message}
                      inputProps={{ readOnly: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Controller
                  name='load_amount'
                  control={control}
                  rules={{
                    required: 'This field is required',
                    validate: value => value > 0 || 'Load balance must be greater than 0'
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Load Amount'
                      error={!!errors.load_amount}
                      helperText={errors.load_amount?.message}
                    />
                  )}
                />
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
              Top Up
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleClose}>
              Close
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default DialogTopupAccount

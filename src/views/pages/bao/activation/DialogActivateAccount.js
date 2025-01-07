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

// ** Hooks
import { useSession } from 'next-auth/react'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogActivateAccount = ({ account, refreshData }) => {
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
    refreshData()
  }

  const { data: session } = useSession()

  const bao_id = session?.user?.id

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
      bao_id: bao_id,
      account_type: accountType
    }
    try {
      const response = await fetch('/api/bao/active/user', {
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

      toast.success('Account Activated Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'An unexpected error occurred')
    }
  }

  return (
    <Box>
      <Button size='small' startIcon={<ViewIcon />} onClick={() => setShow(true)} variant='outlined'>
        Activate Account
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
                Activate Account
              </Typography>
            </Box>
            <Grid container spacing={6}>
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
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel htmlFor='status-select'>Status</InputLabel>
                  <Controller
                    name='status'
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => (
                      <Select
                        id='status-select'
                        label='Status'
                        {...field}
                        onChange={e => {
                          field.onChange(e)
                        }}
                      >
                        <MenuItem value='Active'>Active</MenuItem>
                        <MenuItem value='Inactive'>Inactive</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
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
              Activate
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

export default DialogActivateAccount

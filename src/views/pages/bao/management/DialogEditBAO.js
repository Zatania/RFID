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
import FormControl from '@mui/material/FormControl'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import EditIcon from '@mui/icons-material/Edit'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Card from '@mui/material/Card'

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

const DialogEditBAO = ({ bao, refreshData }) => {
  const [show, setShow] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [baoID, setBAOID] = useState('')
  const [baoImageUploaded, setBAOImageUploaded] = useState(false)
  const [baoImagePath, setBAOImagePath] = useState('')
  const [baoImage, setBAOImage] = useState('')

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
    setBAOImageUploaded(false)
    setBAOImagePath('')
    setBAOImage('')
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

      if (baoImage && baoImage !== 'default.png') {
        await axios.delete(`/api/image/${baoImage}`)
      }

      return response.data.imagePath
    } catch (error) {
      console.error('Image upload error:', error.response ? error.response.data : error.message)
      toast.error(error.response ? error.response.data.error : 'Failed to upload image')

      return ''
    }
  }

  const onSubmit = async data => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    } else {
      data.password = bao.password
    }

    const formData = {
      ...data,
      bao_id: baoID,
      image: baoImagePath || 'default.png'
    }
    try {
      const response = await fetch('/api/bao', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData })
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      toast.success('BAO Information Edited Successfully')
      handleClose()
    } catch (error) {
      if (error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to submit form')
      }
    }
  }

  useEffect(() => {
    if (bao) {
      setBAOID(bao.bao_id)
      setValue('last_name', bao.last_name)
      setValue('first_name', bao.first_name)
      setValue('middle_name', bao.middle_name)
      setBAOImagePath(bao.image)
      setBAOImage(bao.image)
      setValue('username', bao.username)
    }
  }, [setValue, bao])

  return (
    <Card>
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
                Edit BAO Information
              </Typography>
              <Typography variant='body2'>Edit BAO Information</Typography>
            </Box>
            <Grid container spacing={6}>
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
                        id='bao-image-upload'
                        style={{ display: 'none' }}
                        onChange={async ({ target }) => {
                          if (target.files && target.files.length > 0) {
                            const file = target.files[0]
                            const imagePath = await handleImageUpload(file)
                            if (imagePath) {
                              setBAOImageUploaded(true)
                              setBAOImagePath(imagePath)
                            }
                          }
                        }}
                      />
                      {baoImage ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <img
                            src={`/api/image/${baoImagePath}`}
                            alt='BAO Profile Image'
                            style={{ maxWidth: '50%', cursor: 'pointer' }}
                            onClick={() => document.getElementById('bao-image-upload').click()}
                          />
                        </Box>
                      ) : (
                        <Button
                          variant='outlined'
                          component='label'
                          htmlFor='bao-image-upload'
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
                <Typography variant='body1'>BAO Information</Typography>
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
                <FormControl fullWidth>
                  <InputLabel htmlFor='auth-login-v2-password'>Password</InputLabel>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <OutlinedInput
                        value={value}
                        onBlur={onBlur}
                        label='Password'
                        onChange={onChange}
                        id='auth-login-v2-password'
                        error={Boolean(errors.password)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                            </IconButton>
                          </InputAdornment>
                        }
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
            <Button variant='contained' sx={{ mr: 1 }} type='submit'>
              Submit
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  )
}

export default DialogEditBAO

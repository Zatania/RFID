// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Select from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: 4,
  marginRight: theme.spacing(5)
}))

const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const TabAccount = ({ user }) => {
  // ** State
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [userInput, setUserInput] = useState('yes')
  const [imgSrc, setImgSrc] = useState(`/api/image/${user.image}`)
  const [userImageUploaded, setUserImageUploaded] = useState(false)
  const [userImagePath, setUserImagePath] = useState('')
  const [secondDialogOpen, setSecondDialogOpen] = useState(false)

  // ** Hooks
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm()

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

  const handleInputImageReset = () => {
    setUserImageUploaded(false)
    setUserImagePath('')
    setImgSrc(`/api/image/${user.image}`)
  }

  const onSubmit = async data => {
    const imagePath = userImageUploaded ? userImagePath : user.image
    const updatedData = { ...data, image: imagePath, id: user.id }
    try {
      const response = await axios.put('/api/bao/settings', { updatedData })

      if (response.status !== 200) {
        toast.error(response.data.message || 'Failed to submit form')
      }

      toast.success('User Information Updated Successfully')
      window.location.reload()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  useEffect(() => {
    if (user) {
      setValue('last_name', user?.last_name)
      setValue('first_name', user?.first_name)
      setValue('middle_name', user?.middle_name)
      setValue('username', user?.username)
    }
  }, [setValue, user])

  return (
    <Grid container spacing={6}>
      {/* Account Details Card */}
      <Grid item xs={12}>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ pb: theme => `${theme.spacing(10)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImgStyled src={userImageUploaded ? `/api/image/${userImagePath}` : imgSrc} alt='Profile Pic' />
                <div>
                  <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                    Upload New Photo
                    <input
                      hidden
                      type='file'
                      value={inputValue}
                      accept='image/png, image/jpeg'
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
                      id='account-settings-upload-image'
                    />
                  </ButtonStyled>
                  <ResetButtonStyled color='secondary' variant='outlined' onClick={handleInputImageReset}>
                    Reset
                  </ResetButtonStyled>
                  <Typography variant='caption' sx={{ mt: 4, display: 'block', color: 'text.disabled' }}>
                    Allowed PNG or JPEG. Max size of 2MB.
                  </Typography>
                </div>
              </Box>
            </CardContent>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item sm={12} xs={12}>
                  <Typography variant='body1'>User Information</Typography>
                </Grid>
                <Grid item sm={4} xs={12}>
                  <Controller
                    name='last_name'
                    control={control}
                    rules={{
                      required: 'This field is required'
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Last Name'
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        InputLabelProps={{
                          shrink: !!field.value // Ensures the label shrinks when there's input
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
                      required: 'This field is required'
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='First Name'
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        InputLabelProps={{
                          shrink: !!field.value // Ensures the label shrinks when there's input
                        }}
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
                        InputLabelProps={{
                          shrink: !!field.value // Ensures the label shrinks when there's input
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
                        InputLabelProps={{
                          shrink: !!field.value // Ensures the label shrinks when there's input
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type='submit' variant='contained' sx={{ mr: 4 }}>
                    Save Changes
                  </Button>
                  <Button
                    type='reset'
                    variant='outlined'
                    color='secondary'
                    onClick={() =>
                      reset({
                        last_name: user?.last_name || '',
                        first_name: user?.first_name || '',
                        middle_name: user?.middle_name || '',
                        username: user?.username || ''
                      })
                    }
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TabAccount

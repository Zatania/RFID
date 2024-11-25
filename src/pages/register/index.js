// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import LinkStyled from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import * as bcrypt from 'bcryptjs'
import toast from 'react-hot-toast'

// ** Hooks
import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Styled Components
const LoginIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const LoginIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '35rem'
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: '100%'
  }
}))

const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    width: '100%'
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { mt: theme.spacing(8) }
}))

const RegisterPage = () => {
  // ** Hooks
  const router = useRouter()
  const theme = useTheme()
  const bgColors = useBgColor()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  })

  const handleClose = () => {
    router.push('/')
  }

  const onSubmit = async data => {
    const password = data.password

    const hashedPassword = await bcrypt.hash(password, 10)

    data.password = hashedPassword

    const formData = {
      ...data,
      image: 'default.png'
    }
    try {
      const response = await fetch('/api/register', {
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

      toast.success('Registered Successfully')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to submit form')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className='content-right'>
        {!hidden ? (
          <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <LoginIllustrationWrapper>
              <LoginIllustration alt='login-illustration' src={`/images/pages/bg.png`} />
            </LoginIllustrationWrapper>
          </Box>
        ) : null}
        <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
          <Box
            sx={{
              p: 12,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper'
            }}
          >
            <BoxWrapper>
              <Box
                sx={{
                  top: 30,
                  left: 40,
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg
                  width={35}
                  height={29}
                  version='1.1'
                  viewBox='0 0 30 23'
                  xmlns='http://www.w3.org/2000/svg'
                  xmlnsXlink='http://www.w3.org/1999/xlink'
                >
                  <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                    <g id='Artboard' transform='translate(-95.000000, -51.000000)'>
                      <g id='logo' transform='translate(95.000000, 50.000000)'>
                        <image x='0' y='0' width='25' height='25' xlinkHref='/images/logo.png' />
                      </g>
                    </g>
                  </g>
                </svg>
                <Typography
                  variant='h6'
                  sx={{
                    ml: 3,
                    lineHeight: 1,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '1.5rem !important'
                  }}
                >
                  {themeConfig.templateName}
                </Typography>
              </Box>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>Register your account!</TypographyStyled>
                <Typography variant='body2'>Please fill-in completely.</Typography>
              </Box>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={5}>
                  <Grid item sm={12} xs={12}>
                    <Typography variant='body1'>Personal Information</Typography>
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
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel htmlFor='type-select'>Type</InputLabel>
                      <Controller
                        name='type'
                        control={control}
                        rules={{ required: 'This field is required' }}
                        render={({ field }) => (
                          <Select
                            id='type-select'
                            label='Type'
                            {...field}
                            onChange={e => {
                              field.onChange(e)
                            }}
                          >
                            <MenuItem value='Student'>Student</MenuItem>
                            <MenuItem value='Staff'>Staff</MenuItem>
                            <MenuItem value='Outsider'>Outsider</MenuItem>
                          </Select>
                        )}
                      />
                      {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item sm={12} xs={12}>
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
                  <Grid item sm={12} xs={12}>
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
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                  Register
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Typography variant='body2' sx={{ mr: 2 }}>
                    Already have an account?
                  </Typography>
                  <Typography variant='body2'>
                    <LinkStyled href='/login'>Log in instead</LinkStyled>
                  </Typography>
                </Box>
              </form>
            </BoxWrapper>
          </Box>
        </RightWrapper>
      </Box>
    </LocalizationProvider>
  )
}
RegisterPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
RegisterPage.guestGuard = true

export default RegisterPage

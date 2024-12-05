// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Import
import { useSession } from 'next-auth/react'

// ** MUI Imports
import { Grid, Card, CardContent, Box, Typography, styled } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks Imports
import dayjs from 'dayjs'

// ** Views Imports
import DialogEditProfile from 'src/views/pages/user/profile/DialogEditProfile'

// ** Third Party Imports
import axios from 'axios'
import toast from 'react-hot-toast'

const ProfilePicture = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: theme.shape.borderRadius,
  border: `5px solid ${theme.palette.common.white}`,
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(4)
  }
}))

const ProfilePage = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)

  const username = session?.user.username

  const capitalizeFirstLetter = string => {
    if (string === null) {
      return ' '
    }

    return string?.charAt(0).toUpperCase() + string?.slice(1)
  }

  const formatDate = date => {
    if (date === null) {
      return ' '
    }

    return dayjs(date).format('MMMM DD, YYYY')
  }

  const data = {
    fullName: session?.user.fullname,
    designation: capitalizeFirstLetter(session?.user.role),
    profileImg: `/api/image/${session?.user.image}`,
    loadIcon: 'mdi:cash'
  }

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.post(`/api/user/profile/${username}`)

      setUser(res.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Error fetching user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  let fullName

  if (user) {
    if (user?.user_info?.middle_name !== null) {
      fullName =
        capitalizeFirstLetter(user?.user_info?.first_name) +
        ' ' +
        capitalizeFirstLetter(user?.user_info?.middle_name) +
        ' ' +
        capitalizeFirstLetter(user?.user_info?.last_name)
    } else {
      fullName =
        capitalizeFirstLetter(user?.user_info?.first_name) + ' ' + capitalizeFirstLetter(user?.user_info?.last_name)
    }
  } else {
    fullName = ''
  }

  const about = {
    profile: [
      { property: 'Full Name: ', value: fullName || '', icon: 'mdi:account-outline' },
      {
        property: 'Phone Number: ',
        value: capitalizeFirstLetter(user?.user_info?.phone_number) || '',
        icon: 'mdi:phone-outline'
      },
      {
        property: 'Email Address: ',
        value: capitalizeFirstLetter(user?.user_info?.email_address) || '',
        icon: 'mdi:email-outline'
      },
      {
        property: 'Home Address: ',
        value: capitalizeFirstLetter(user?.user_info?.address) || '',
        icon: 'mdi:home-outline'
      }
    ],
    license_info: [
      {
        property: 'License Number: ',
        value: capitalizeFirstLetter(user?.license_info?.license_number) || '',
        icon: 'mdi:license'
      },
      {
        property: 'Expiration: ',
        value: formatDate(user?.license_info?.expiration) || '',
        icon: 'mdi:calendar-month-outline'
      }
    ],
    vehicles: user?.vehicles?.reduce((acc, vehicle) => {
      const plate_number = vehicle.plate_number || 'Unknown Plate Number'

      if (!acc[plate_number]) {
        acc[plate_number] = []
      }

      acc[plate_number].push({
        property: 'Maker: ',
        value: capitalizeFirstLetter(vehicle.maker) || '',
        icon: 'mdi:car',
        details: [
          {
            property: 'Model: ',
            value: vehicle.model,
            icon: 'mdi:car-side'
          },
          {
            property: 'Color: ',
            value: vehicle.color,
            icon: 'mdi:palette'
          },
          {
            property: 'OR Number: ',
            value: vehicle.or_number,
            icon: 'mdi:card-account-details'
          },
          {
            property: 'CR Number: ',
            value: vehicle.cr_number,
            icon: 'mdi:card-account-details'
          },
          {
            property: 'Registration Expiry: ',
            value: formatDate(vehicle.registration_expiration),
            icon: 'mdi:calendar-clock'
          }
        ]
      })

      return acc
    }, {})
  }

  const loadIcon = data?.loadIcon || 'mdi:briefcase-outline'

  const renderList = arr => {
    if (arr && arr.length) {
      return arr.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            '&:not(:last-of-type)': { mb: 4 },
            '& svg': { color: 'text.secondary' }
          }}
        >
          <Box sx={{ display: 'flex', mr: 2 }}>
            <Icon icon={item.icon} />
          </Box>

          <Box sx={{ columnGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.property}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>{item.value}</Typography>
          </Box>
        </Box>
      ))
    } else {
      return null
    }
  }

  return (
    <Grid container spacing={6}>
      {user?.user_info?.status === 'Pending' && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 6 }}>
                <Typography sx={{ mb: 5, display: 'block', textTransform: 'uppercase' }}>ANNOUNCEMENT</Typography>
                <Typography variant='caption' sx={{ ml: 1, color: 'red', fontWeight: 600 }}>
                  Your account is still pending. Please visit the admin office for further verification.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
      <Grid item xs={12}>
        <Card>
          <CardContent
            sx={{
              pt: 0,
              mt: 5,
              display: 'flex',
              alignItems: 'flex-end',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}
          >
            <ProfilePicture src={data.profileImg} alt='Profile Picture' />
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                ml: { xs: 0, md: 6 },
                alignItems: 'flex-end',
                flexWrap: ['wrap', 'nowrap'],
                justifyContent: ['center', 'space-between']
              }}
            >
              <Box sx={{ mb: [6, 0], display: 'flex', flexDirection: 'column', alignItems: ['center', 'flex-start'] }}>
                <Typography variant='h5' sx={{ mb: 4 }}>
                  {loading ? 'Loading...' : `${user?.user_info?.first_name || ''} ${user?.user_info?.last_name || ''}`}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: ['center', 'flex-start']
                  }}
                >
                  <Box
                    sx={{ mr: 5, display: 'flex', alignItems: 'center', '& svg': { mr: 1, color: 'text.secondary' } }}
                  >
                    <Icon icon={loadIcon} />
                    <Typography sx={{ ml: 1, color: 'text.secondary', fontWeight: 600 }}>
                      {loading ? 'Loading...' : 'Php ' + (user?.rfid?.load_balance || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <DialogEditProfile user={user} fetchUser={fetchUser} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {loading ? (
        <Grid item xs={12}>
          <Card>
            <CardContent
              sx={{
                pt: 0,
                mt: 5,
                display: 'flex',
                alignItems: 'flex-end',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              <Box sx={{ mb: 6 }}>
                <CircularProgress />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        <>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 6 }}>
                  <Typography variant='caption' sx={{ mb: 5, display: 'block', textTransform: 'uppercase' }}>
                    Personal Information
                  </Typography>
                  {renderList(about.profile)}
                </Box>
                <Divider sx={{ mt: 5, mb: 5 }} />
                <Box sx={{ mb: 6 }}>
                  <Typography variant='caption' sx={{ mb: 5, display: 'block', textTransform: 'uppercase' }}>
                    Driver's License Information
                  </Typography>
                  {renderList(about.license_info)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 6 }}>
                  <Typography variant='caption' sx={{ mb: 5, display: 'block', textTransform: 'uppercase' }}>
                    Vehicles Information
                  </Typography>
                  {Object.keys(about.vehicles).map(plate_number => (
                    <Box key={plate_number}>
                      <Typography variant='body1' sx={{ mb: 2, fontWeight: 600 }}>
                        {plate_number}
                      </Typography>
                      {about.vehicles[plate_number].map((vehicle, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                          {renderList([vehicle])}
                          {vehicle.details && vehicle.details.length > 0 && renderList(vehicle.details)}
                        </Box>
                      ))}
                      <Divider sx={{ mt: 5, mb: 5 }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  )
}

ProfilePage.acl = {
  action: 'read',
  subject: 'profile-page'
}

export default ProfilePage

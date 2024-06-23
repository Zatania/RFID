// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Third Party Import
import dayjs from 'dayjs'
import { CardContent } from '@mui/material'
import axios from 'axios'
import { useSession } from 'next-auth/react'

const DashboardPage = () => {
  // State to store user and vehicle info
  const [currentDateTime, setCurrentDateTime] = useState(dayjs().format('MMMM DD, YYYY hh:mm:ss A'))
  const [rfid, setRfid] = useState('')
  const [user, setUser] = useState('')
  const [message, setMessage] = useState('')

  const { data: session } = useSession()

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000')

    console.log('Connecting to websocket server...')

    socket.addEventListener('message', event => {
      const message = event.data

      setRfid(message)
    })

    // Ensure proper cleanup
    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(dayjs().format('MMMM DD, YYYY hh:mm:ss A'))
    }, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (rfid) {
      axios
        .post(`/api/user/attendance/${rfid}`, { guard_id: session.user.id })
        .then(response => {
          setUser(response.data.user)
          setMessage(response.data.message)
        })
        .catch(error => console.error('Error fetching data', error))

      setRfid('')
    }
  }, [rfid, session])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        marginBottom: '10px',
        marginTop: '10px'
      }}
    >
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
            {currentDateTime}
          </Typography>
          {user ? (
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <Box style={{ width: '500px', height: '200px', display: 'flex', alignItems: 'left', flex: '1' }}>
                <Box sx={{ marginRight: '50px' }}>
                  <img
                    src={`/api/image/${user.image}`}
                    alt='User'
                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                  />
                </Box>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    User Info
                  </Typography>
                  <Typography>
                    Name: {user.first_name} {user.last_name}
                  </Typography>
                  <Typography>Phone: {user.phone}</Typography>
                  <Typography>Address: {user.address}</Typography>
                </Box>
              </Box>

              <Box style={{ width: '500px', height: '200px', display: 'flex', alignItems: 'left', flex: '1' }}>
                <Box sx={{ marginRight: '50px' }}>
                  <img
                    src={`/api/image/${user.vehicle_image}`}
                    alt='Vehicle'
                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                  />
                </Box>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    Vehicle Info
                  </Typography>
                  <Typography>Maker: {user.vehicle_maker}</Typography>
                  <Typography>Model: {user.vehicle_model}</Typography>
                  <Typography>Color: {user.vehicle_color}</Typography>
                  <Typography>Plate Number: {user.vehicle_plate_number}</Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Container display='flex' flexDirection='column' justifyContent='center'>
              <Box display='flex' alignItems='center' marginTop={5} style={{ width: '500px', height: '200px' }}>
                <Box sx={{ marginRight: '50px' }}>
                  <img
                    src='/images/avatars/placeholder.png'
                    alt='User'
                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                  />
                </Box>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    User Info
                  </Typography>
                  <Typography>Name: Unknown</Typography>
                  <Typography>Phone: Unknown</Typography>
                  <Typography>Address: Unknown</Typography>
                </Box>
              </Box>
              <Box display='flex' alignItems='center' marginTop={5} style={{ width: '500px', height: '200px' }}>
                <Box sx={{ marginRight: '50px' }}>
                  <img
                    src='/images/avatars/placeholder.png'
                    alt='User'
                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                  />
                </Box>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    Vehicle Info
                  </Typography>
                  <Typography>Maker: Unknown</Typography>
                  <Typography>Model: Unknown</Typography>
                  <Typography>Color: Unknown</Typography>
                  <Typography>Plate Number: Unknown</Typography>
                </Box>
              </Box>
            </Container>
          )}
          {message && (
            <Typography
              variant='h6'
              sx={{ textAlign: 'center', color: 'red', marginBottom: '10px', marginTop: '30px' }}
            >
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

DashboardPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
DashboardPage.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default DashboardPage

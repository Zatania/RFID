// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Third Party Import
import dayjs from 'dayjs'
import axios from 'axios'
import { useSession } from 'next-auth/react'

const DashboardPage = () => {
  // State to store user and vehicle info
  const [currentDateTime, setCurrentDateTime] = useState(dayjs().format('MMMM DD, YYYY hh:mm:ss A'))
  const [rfid, setRfid] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState([])

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
          fetchLogs()
        })
        .catch(error => console.error('Error fetching data', error))

      setRfid('')
    }
  }, [rfid, session])

  // Refresh list of logs
  const fetchLogs = () => {
    axios
      .get('/api/user/logs/daily')
      .then(response => {
        const currentDay = dayjs().startOf('day')
        const filteredLogs = response.data.filter(log => dayjs(log.timestamp).isAfter(currentDay))
        setLogs(filteredLogs)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display='flex' flexDirection='column' alignItems='center'>
                  <img
                    src={user ? `/api/image/${user.image}` : '/images/avatars/placeholder.png'}
                    alt='User'
                    style={{ width: '150px', height: '150px', borderRadius: '8px', marginBottom: '10px' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h5' align='center' gutterBottom>
                  Welcome to LSPU "{user ? `${user.first_name} ${user.last_name}` : '{}'}"
                </Typography>
                <Box sx={{ marginTop: '20px', marginBottom: '20px' }}>
                  {message && (
                    <Typography
                      variant='body1'
                      sx={{ textAlign: 'center', color: 'red', marginBottom: '10px', marginTop: '30px' }}
                    >
                      {message}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={3} sx={{ marginTop: '20px' }}>
                  <Grid item xs={6}>
                    <Box display='flex' flexDirection='column' alignItems='center'>
                      <img
                        src={user ? `/api/image/${user.vehicle_image}` : '/images/avatars/placeholder.png'}
                        alt='Vehicle'
                        style={{ width: '100px', height: '100px', borderRadius: '8px' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='h5' gutterBottom>
                      Vehicle Information
                    </Typography>
                    <Typography>Maker: {user ? user.vehicle_maker : 'Unknown'}</Typography>
                    <Typography>Model: {user ? user.vehicle_model : 'Unknown'}</Typography>
                    <Typography>Color: {user ? user.vehicle_color : 'Unknown'}</Typography>
                    <Typography>Plate Number: {user ? user.vehicle_plate_number : 'Unknown'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='h4' align='center' gutterBottom>
                  PIYUCHECKPOINT
                </Typography>
                <Typography variant='h6' align='center' gutterBottom>
                  Please Swipe Your Card
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h5' align='center' gutterBottom>
                  {currentDateTime}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: '20px', marginBottom: '20px' }}>
                <Box>
                  <Typography variant='h6' align='center' gutterBottom>
                    LOGS
                  </Typography>
                  <Paper
                    sx={{
                      height: '300px',
                      overflowY: 'scroll',
                      padding: '10px',
                      border: '1px solid #ddd'
                    }}
                  >
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <Box key={index} sx={{ marginBottom: '10px' }} align='center'>
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <Typography variant='body2'>{log.user_full_name}</Typography>
                              <Typography variant='caption' color='textSecondary'>
                                {log.timestamp}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              {log.status === 'TIME IN' ? (
                                <Typography variant='h6' color='primary'>
                                  {log.status}
                                </Typography>
                              ) : log.status === 'TIME OUT' ? (
                                <Typography variant='h6' color='secondary'>
                                  {log.status}
                                </Typography>
                              ) : (
                                <Typography variant='h6' color='error'>
                                  {log.status}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      ))
                    ) : (
                      <Typography>No logs available</Typography>
                    )}
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

DashboardPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
DashboardPage.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default DashboardPage

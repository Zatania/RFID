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
  const [currentDateTime, setCurrentDateTime] = useState(dayjs().format('MMMM DD, YYYY hh:mm:ss A'))
  const [rfid, setRfid] = useState('')
  const [vehicle_rfid, setVehicleRfid] = useState('')
  const [account, setAccount] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState([])

  const { data: session } = useSession()

  useEffect(() => {
    // WebSocket for user RFID
    const userSocket = new WebSocket('ws://localhost:4000/user')

    userSocket.addEventListener('message', event => {
      const message = event.data
      console.log('User RFID:', message)
      setRfid(message) // Set user RFID from WebSocket
    })

    // WebSocket for vehicle RFID
    const vehicleSocket = new WebSocket('ws://localhost:4000/vehicle')

    vehicleSocket.addEventListener('message', event => {
      const vehicleMessage = event.data
      console.log('Vehicle RFID:', vehicleMessage)
      setVehicleRfid(vehicleMessage) // Set vehicle RFID from WebSocket
    })

    // Ensure proper cleanup
    return () => {
      userSocket.close()
      vehicleSocket.close()
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
    // Only proceed if both RFID values are available
    if (vehicle_rfid) {
      // Fetch vehicle data based on vehicle RFID
      axios
        .get(`/api/attendance/vehicle/${vehicle_rfid}`)
        .then(response => {
          setVehicle(response.data)

          if (rfid) {
            axios.get(`/api/attendance/user/${rfid}`).then(response => {
              setAccount(response.data)
            })

            /*
            // Proceed to post attendance only if the user RFID is valid
            axios
              .post(`/api/attendance/${rfid}`, { guard_id: session.user.id })
              .then(response => {
                setAccount(response.data.account)
                setMessage(response.data.message)
                fetchLogs()
              })
              .catch(error => console.error('Error posting attendance data', error))
 */
            // Reset RFID states after processing
            setRfid('')
            setVehicleRfid('')
          }
        })
        .catch(error => console.error('Error fetching vehicle data', error))
    }
  }, [rfid, vehicle_rfid, session])

  // Refresh list of logs
  const fetchLogs = () => {
    axios
      .get('/api/user/logs/daily')
      .then(response => {
        const currentDay = dayjs().startOf('day')
        const filteredLogs = response.data.filter(log => dayjs(log.daily_timestamp).isAfter(currentDay))
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
        minHeight: '100vh',
        bgcolor: '#804BDF'
      }}
    >
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            bgcolor: '#9E69FD',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #9E69FD'
          }}
        >
          <Grid container spacing={6} sx={{ marginLeft: '20px', marginRight: '20px' }}>
            <Grid item sm={12} xs={12}>
              <Typography variant='h4' align='center' sx={{ fontWeight: 'bold' }}>
                PIYUCHECKPOINT
              </Typography>
              <Typography variant='h6' align='center' sx={{ color: 'red' }}>
                Please Scan Your Card
              </Typography>
              <Typography variant='h6' align='center'>
                {currentDateTime}
              </Typography>
            </Grid>
            <Grid item sm={12} xs={12}>
              <Grid container spacing={6}>
                <Grid item sm={6} xs={12}>
                  <Grid container spacing={6}>
                    <Grid item sm={12} xs={12}>
                      <Box display='flex' flexDirection='column' alignItems='center'>
                        <img
                          src={account ? `/api/image/${account.image}` : '/images/avatars/placeholder.png'}
                          alt='Account Image'
                          style={{ width: '150px', height: '150px', borderRadius: '8px', marginBottom: '10px' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                      <Typography variant='h5' align='center' gutterBottom sx={{ fontWeight: 'bold' }}>
                        Welcome to LSPU {account ? `"${account.first_name} ${account.last_name}"` : ''}
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
                    <Grid item sm={12} xs={12}>
                      <Grid container spacing={2} sx={{ marginTop: '5px' }}>
                        <Grid item sm={6} xs={12}>
                          <Typography variant='h5' gutterBottom>
                            Vehicle Information
                          </Typography>
                          <Typography>Maker: {vehicle ? vehicle.maker : 'Unknown'}</Typography>
                          <Typography>Model: {vehicle ? vehicle.model : 'Unknown'}</Typography>
                          <Typography>Color: {vehicle ? vehicle.color : 'Unknown'}</Typography>
                          <Typography>Plate Number: {vehicle ? vehicle.plate_number : 'Unknown'}</Typography>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                          <Box display='flex' flexDirection='column' alignItems='center'>
                            <img
                              src={vehicle ? `/api/image/${vehicle.image}` : '/images/avatars/placeholder.png'}
                              alt='Vehicle'
                              style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12}>
                      <Box>
                        <Typography variant='h6' align='center' gutterBottom sx={{ fontWeight: 'bold' }}>
                          Currently Parked Vehicles
                        </Typography>
                        <Paper
                          sx={{
                            height: '150px',
                            overflowY: 'scroll',
                            padding: '10px',
                            border: '1px solid #fff',
                            bgcolor: '#f5f5f5'
                          }}
                        >
                          {logs.length > 0 ? (
                            logs.map((log, index) => (
                              <Box key={index} sx={{ marginBottom: '10px' }} align='center'>
                                <Grid container spacing={3}>
                                  <Grid item xs={6}>
                                    <Typography variant='body2'>{log.user_full_name}</Typography>
                                    <Typography variant='caption' color='textSecondary'>
                                      {log.daily_timestamp}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    {log.daily_status === 'TIME IN' ? (
                                      <Typography variant='h6' color='primary'>
                                        {log.daily_status}
                                      </Typography>
                                    ) : log.status === 'TIME OUT' ? (
                                      <Typography variant='h6' color='secondary'>
                                        {log.daily_status}
                                      </Typography>
                                    ) : (
                                      <Typography variant='h6' color='error'>
                                        {log.daily_status}
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
                    <Grid item sm={12} xs={12}>
                      <Box>
                        <Typography variant='h6' align='center' gutterBottom sx={{ fontWeight: 'bold' }}>
                          Logs
                        </Typography>
                        <Paper
                          sx={{
                            height: '150px',
                            overflowY: 'scroll',
                            padding: '10px',
                            border: '1px solid #fff',
                            bgcolor: '#f5f5f5'
                          }}
                        >
                          {logs.length > 0 ? (
                            logs.map((log, index) => (
                              <Box key={index} sx={{ marginBottom: '10px' }} align='center'>
                                <Grid container spacing={3}>
                                  <Grid item xs={6}>
                                    <Typography variant='body2'>{log.user_full_name}</Typography>
                                    <Typography variant='caption' color='textSecondary'>
                                      {log.daily_timestamp}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    {log.daily_status === 'TIME IN' ? (
                                      <Typography variant='h6' color='primary'>
                                        {log.daily_status}
                                      </Typography>
                                    ) : log.status === 'TIME OUT' ? (
                                      <Typography variant='h6' color='secondary'>
                                        {log.daily_status}
                                      </Typography>
                                    ) : (
                                      <Typography variant='h6' color='error'>
                                        {log.daily_status}
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
            </Grid>
          </Grid>
        </Box>
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

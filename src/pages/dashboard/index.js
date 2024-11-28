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
import Divider from '@mui/material/Divider'

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
    if (rfid) {
      // Fetch user account data based on RFID
      axios
        .get(`/api/attendance/user/${rfid}`)
        .then(response => {
          const accountData = response.data
          setAccount(accountData) // Set account data
          const account_id = accountData.id

          // Check if the account type is Visitor
          if (accountData.type === 'Visitor') {
            // If it's a Visitor, proceed directly to post attendance
            axios
              .post(`/api/attendance/${account_id}`, {
                guard_id: session.user.id,
                account_type: accountData.type // Add account type here
              })
              .then(response => {
                setMessage(response.data.message)
                fetchLogs() // Fetch updated logs
              })
              .catch(error => console.error('Error posting attendance data for Visitor', error))
          } else if (vehicle_rfid) {
            // Fetch vehicle data based on vehicle RFID
            axios
              .get(`/api/attendance/vehicle/${vehicle_rfid}`)
              .then(response => {
                const vehicleData = response.data
                setVehicle(vehicleData)

                // Check if user ID, premium ID matches account ID
                if (vehicleData.user_id === accountData.id || vehicleData.premium_id === accountData.id) {
                  // Proceed to post attendance if the user RFID is valid
                  axios
                    .post(`/api/attendance/${account_id}`, {
                      guard_id: session.user.id,
                      account_type: accountData.type // Add account type here
                    })
                    .then(response => {
                      setMessage(response.data.message)
                      fetchLogs()
                    })
                    .catch(error => console.error('Error posting attendance data', error))
                } else {
                  // Handle case where there is no match
                  console.error('No matching account ID found for vehicle')
                }
              })
              .catch(error => console.error('Error fetching vehicle data', error))
          }
        })
        .catch(error => console.error('Error fetching account data', error))

      // Reset RFID states after processing
      setRfid('')
      setVehicleRfid('')
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
        bgcolor: '#79BAEC'
      }}
    >
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            bgcolor: '#73C2FB',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Grid container spacing={6} sx={{ marginLeft: '20px', marginRight: '20px' }}>
            <Grid item sm={12} xs={12}>
              <Grid container spacing={1}>
                <Grid item sm={12} xs={12}>
                  <Typography variant='h4' align='center' sx={{ color: '#252324', fontWeight: 'bold' }}>
                    PIYUCHECKPOINT
                  </Typography>
                </Grid>
                <Grid item sm={12} xs={12}>
                  <Typography variant='h6' align='center' sx={{ color: '#DD0004', fontWeight: 'bold' }}>
                    Please Scan Your Card
                  </Typography>
                </Grid>
                <Grid item sm={12} xs={12}>
                  <Typography variant='h6' align='center' sx={{ color: '#252324' }}>
                    {currentDateTime}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item sm={12} xs={12}>
              <Grid container spacing={12}>
                <Grid item sm={6} xs={12}>
                  <Grid container spacing={6}>
                    <Grid item sm={12} xs={12}>
                      <Box display='flex' flexDirection='column' alignItems='center'>
                        <img
                          src={account ? `/api/image/${account.image}` : '/images/avatars/placeholder.png'}
                          alt='Account Image'
                          style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                      <Typography variant='h5' align='center' sx={{ color: '#252324' }} gutterBottom>
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
                    <Box
                      sx={{
                        display: 'flex',
                        textAlign: 'left',
                        borderRadius: '8px',
                        bgcolor: '#4682B4',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <Grid item sm={12} xs={12}>
                        <Grid container spacing={2} sx={{ marginTop: '5px' }}>
                          <Grid item sm={12} xs={12}>
                            <Typography variant='h5' sx={{ color: '#252324' }} gutterBottom>
                              Vehicle Information
                            </Typography>
                            <Divider variant='middle' />
                          </Grid>
                          <Grid item sm={6} xs={12}>
                            <Typography sx={{ color: '#252324' }}>
                              Maker: {vehicle ? vehicle.maker : 'Unknown'}
                            </Typography>
                            <Typography sx={{ color: '#252324' }}>
                              Model: {vehicle ? vehicle.model : 'Unknown'}
                            </Typography>
                            <Typography sx={{ color: '#252324' }}>
                              Color: {vehicle ? vehicle.color : 'Unknown'}
                            </Typography>
                            <Typography sx={{ color: '#252324' }}>
                              Plate Number: {vehicle ? vehicle.plate_number : 'Unknown'}
                            </Typography>
                          </Grid>
                          <Grid item sm={6} xs={12}>
                            <Box display='flex' flexDirection='column' alignItems='center'>
                              <img
                                src={vehicle ? `/api/image/${vehicle.image}` : '/images/avatars/placeholder.png'}
                                alt='Vehicle'
                                style={{
                                  width: '150px',
                                  height: '150px',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Grid container spacing={6}>
                    <Grid item sm={12} xs={12}>
                      <Box
                        sx={{
                          borderRadius: '8px',
                          bgcolor: '#4682B4',
                          padding: '20px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        <Grid container spacing={3}>
                          <Grid item sm={12} xs={12}>
                            <Typography variant='h5' align='center' sx={{ color: '#252324' }} gutterBottom>
                              Currently Parked Vehicles
                            </Typography>
                          </Grid>
                          <Grid item sm={12} xs={12}>
                            <Paper
                              sx={{
                                height: '150px',
                                overflowY: 'scroll',
                                padding: '10px',
                                bgcolor: '#73C2FB'
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
                                <Typography sx={{ color: '#252324' }}>No logs available</Typography>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                      <Box
                        sx={{
                          borderRadius: '8px',
                          bgcolor: '#4682b4',
                          padding: '20px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        <Grid container spacing={3}>
                          <Grid item sm={12} xs={12}>
                            <Typography variant='h5' align='center' sx={{ color: '#252324' }} gutterBottom>
                              Logs
                            </Typography>
                          </Grid>
                          <Grid item sm={12} xs={12}>
                            <Paper
                              sx={{
                                height: '150px',
                                overflowY: 'scroll',
                                padding: '10px',
                                bgcolor: '#73C2FB'
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
                                <Typography sx={{ color: '#252324' }}>No logs available</Typography>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
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

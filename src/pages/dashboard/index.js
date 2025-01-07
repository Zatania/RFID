// ** React Imports
import { useState, useEffect, useCallback } from 'react'

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
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const [currentDateTime, setCurrentDateTime] = useState(dayjs().format('MMMM DD, YYYY hh:mm:ss A'))
  const [rfid, setRfid] = useState('')
  const [vehicleRfid, setVehicleRfid] = useState('')
  const [accountType, setAccountType] = useState(null)
  const [account, setAccount] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [vehicleID, setVehicleID] = useState(null)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState([])
  const [parkedVehicles, setParkedVehicles] = useState([])
  const { data: session } = useSession()

  const guard_id = session.user.id

  // Test sound example
  const deniedAudio = new Audio('/sounds/alert.mp3')

  const fetchUserData = useCallback(async rfid => {
    try {
      const response = await axios.get(`/api/attendance/user/${rfid}`)
      if (response.data) {
        if (response.data.type === 'Visitor') {
          const accountData = {
            id: response.data.id,
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            type: response.data.type
          }

          const vehicleData = {
            maker: response.data.vehicle_maker,
            model: response.data.vehicle_model,
            color: response.data.vehicle_color,
            plate_number: response.data.vehicle_plate_number
          }

          setAccount(accountData)
          setAccountType(accountData.type)
          setVehicle(vehicleData)
        } else {
          setAccount(response.data)
          setAccountType(response.data.type)
        }
      } else {
        setMessage(response.data.message)
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Error fetching user data.')
    }
  }, [])

  const fetchVehicleData = useCallback(async vehicleRfid => {
    try {
      const response = await axios.get(`/api/attendance/vehicle/${vehicleRfid}`)
      if (response.data) {
        setVehicle(response.data)
        setVehicleID(response.data.id)
      } else {
        setMessage(response.data.message)
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Error fetching user data.')
    }
  }, [])

  const parkingAttendance = useCallback(
    async (rfid, vehicleRfid) => {
      const payload = { account, vehicleID, guard_id, rfid, vehicleRfid }
      try {
        const response = await axios.post('/api/attendance', payload)

        // Clean up the RFID values after logging the entry
        setRfid('') // Reset user RFID
        setVehicleRfid('') // Reset vehicle RFID
        setAccountType(null) // Reset account data
        setVehicleID(null) // Reset vehicle ID

        setMessage(response.data)
      } catch (error) {
        console.error('Error while logging entry:', error)

        /* if (error.response) {
          setMessage(error.response.data.message)
          if (error.response.data.message === 'Vehicle does not belong to the user') {
            toast.error('Vehicle does not belong to the user')
            audio.play().catch(err => {
              console.error('Error playing sound:', err)
            })
          }
        } */

        if (error.response) {
          setMessage(error.response.data.message)

          if (
            error.response.data.message ===
            'Access denied: You have more than 3 unresolved violations. Please resolve them to continue using the parking services.'
          ) {
            toast.error('Access denied: Unresolved violations')
            deniedAudio.muted = true
            deniedAudio
              .play()
              .then(() => {
                // After autoplay, you can unmute if needed
                deniedAudio.muted = false
              })
              .catch(err => {
                console.error('Error playing sound:', err)
              })
          } else if (error.response.data.message === 'Vehicle does not belong to the user') {
            toast.error('Vehicle does not belong to the user')
            deniedAudio.muted = true
            deniedAudio
              .play()
              .then(() => {
                // After autoplay, you can unmute if needed
                deniedAudio.muted = false
              })
              .catch(err => {
                console.error('Error playing sound:', err)
              })
          }
        }

        // Clean up the RFID values after logging the entry
        setRfid('') // Reset user RFID
        setVehicleRfid('') // Reset vehicle RFID
        setAccountType(null) // Reset account data
        setVehicleID(null) // Reset vehicle ID
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, vehicleID, guard_id]
  )

  useEffect(() => {
    // WebSocket for user RFID
    const userSocket = new WebSocket('ws://localhost:4000/user')

    userSocket.addEventListener('message', event => {
      const message = event.data
      console.log('User RFID:', message)
      setRfid(message) // Set user RFID from WebSocket

      // Fetch user data when RFID is scanned
      fetchUserData(message)
    })

    // WebSocket for vehicle RFID
    const vehicleSocket = new WebSocket('ws://localhost:4000/vehicle')

    vehicleSocket.addEventListener('message', event => {
      const vehicleMessage = event.data
      console.log('Vehicle RFID:', vehicleMessage)
      setVehicleRfid(vehicleMessage) // Set vehicle RFID from WebSocket

      // Fetch vehicle data when RFID is scanned
      fetchVehicleData(vehicleMessage)
    })

    // WebSocket for logs
    const logsSocket = new WebSocket('ws://localhost:4000/logs') // Assuming this is your WebSocket endpoint for logs
    logsSocket.addEventListener('message', event => {
      const logData = JSON.parse(event.data) // Assuming logs are sent as JSON

      const filteredLogs = logData.filter(log => {
        const logDate = dayjs(log.create_at) // Convert the log date to a dayjs object

        return logDate.format('MM/DD/YY hh:mm A') // Compare the log date with the start of today
      })
      setLogs(filteredLogs)
    })

    // WebSocket for parked vehicles
    const realtimeSocket = new WebSocket('ws://localhost:4000/realtime') // Assuming this is your WebSocket endpoint for parked vehicles
    realtimeSocket.addEventListener('message', event => {
      const realtimeData = JSON.parse(event.data) // Assuming logs are sent as JSON

      setParkedVehicles(realtimeData)
    })

    // Cleanup WebSocket connections on component unmount
    return () => {
      userSocket.close()
      vehicleSocket.close()
      logsSocket.close()
    }
  }, [rfid, vehicleRfid, fetchUserData, fetchVehicleData, parkingAttendance])

  useEffect(() => {
    // Only proceed when the necessary data is available
    if (rfid && accountType) {
      // If Visitor, no need to check for vehicle tag
      if (accountType === 'Visitor' && account) {
        parkingAttendance(rfid)
      }

      // If not Visitor, ensure both vehicle and user RFIDs are present
      else if (accountType !== 'Visitor' && account && vehicleID && vehicleRfid) {
        parkingAttendance(rfid, vehicleRfid)
      }
    }
  }, [rfid, vehicleRfid, accountType, account, vehicleID, parkingAttendance])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(dayjs().format('MMMM DD, YYYY hh:mm:ss A'))
    }, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  // Refresh list of logs
  const fetchLogs = () => {
    axios
      .get('/api/logs/daily')
      .then(response => {
        setLogs(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Refresh list of parked vehicles
  const fetchParkedVehicles = () => {
    axios
      .get('/api/logs/realtime')
      .then(response => {
        setParkedVehicles(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchLogs()
    fetchParkedVehicles()
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'

        /*bgcolor: '#79BAEC'*/
      }}
    >
      <Container>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            bgcolor: '#52B244',
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
                          src={account?.image ? `/api/image/${account.image}` : '/images/default.png'}
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
                            sx={{ textAlign: 'center', color: 'red', marginBottom: '10px', marginTop: '10px' }}
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

                        /*bgcolor: '#4682B4',*/
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
                                src={vehicle?.image ? `/api/image/${vehicle?.image}` : '/images/vehicle.png'}
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

                          /*bgcolor: '#4682B4',*/
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
                                padding: '10px'

                                /*bgcolor: '#73C2FB'*/
                              }}
                            >
                              {parkedVehicles.length > 0 ? (
                                parkedVehicles.map((vh, index) => (
                                  <Box key={index} sx={{ marginBottom: '10px' }} align='center'>
                                    <Grid container spacing={3}>
                                      <Grid item xs={6}>
                                        <Typography variant='body1'>{vh.plate_number}</Typography>
                                        <Typography variant='caption' color='textSecondary'>
                                          {vh.time_in}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={6}>
                                        <Typography variant='h6' color='primary'>
                                          {vh.elapsed_time}
                                        </Typography>
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

                          /*bgcolor: '#4682b4',*/
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
                                padding: '10px'

                                /*bgcolor: '#73C2FB'*/
                              }}
                            >
                              {logs.length > 0 ? (
                                logs.map((log, index) => (
                                  <Box key={index} sx={{ marginBottom: '10px' }} align='center'>
                                    <Grid container spacing={3}>
                                      <Grid item xs={6}>
                                        <Typography variant='body2'>{log.account_name}</Typography>
                                        <Typography variant='caption' color='textSecondary'>
                                          {log.created_at}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={6}>
                                        {log.action === 'TIME IN' ? (
                                          <Typography variant='h6' color='primary'>
                                            {log.action}
                                          </Typography>
                                        ) : log.status === 'TIME OUT' ? (
                                          <Typography variant='h6' color='primary'>
                                            {log.action}
                                          </Typography>
                                        ) : (
                                          <Typography variant='h6' color='error'>
                                            {log.action}
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

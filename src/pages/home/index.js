// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Views Imports
import UserDetails from 'src/views/pages/home/UserDetails'

// ** Third Party Imports
import axios from 'axios'

const Home = () => {
  const [userCount, setUserCount] = useState(0)
  const [guardCount, setGuardCount] = useState(0)
  const [violationCount, setViolationCount] = useState(0)
  const [rfidCount, setRfidCount] = useState(0)

  // Refresh list of users
  const fetchUsers = () => {
    axios
      .get('/api/user/count')
      .then(response => {
        setUserCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchGuards = () => {
    axios
      .get('/api/guard/count')
      .then(response => {
        setGuardCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchViolations = () => {
    axios
      .get('/api/user/violations/count')
      .then(response => {
        setViolationCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchRFID = () => {
    axios
      .get('/api/user/logs/count')
      .then(response => {
        setRfidCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers()
    fetchGuards()
    fetchViolations()
    fetchRFID()
  }, [])

  return (
    <Grid container spacing={3}>
      <Grid item xs={3} md={3}>
        <UserDetails icon='mdi:account-group-outline' color='primary' count={userCount} title='Total Users' />
      </Grid>
      <Grid item xs={3} md={3}>
        <UserDetails
          icon='mdi:shield-account-outline'
          color='primary'
          count={guardCount}
          title='Total Security Guards'
        />
      </Grid>
      <Grid item xs={3} md={3}>
        <UserDetails icon='mdi:alert-outline' color='warning' count={violationCount} title='Total Violations' />
      </Grid>
      <Grid item xs={3} md={3}>
        <UserDetails icon='mdi:card-multiple-outline' color='success' count={rfidCount} title='Total RFID Scanned' />
      </Grid>
    </Grid>
  )
}

Home.acl = {
  action: 'read',
  subject: 'home'
}

export default Home

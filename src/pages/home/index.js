// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Views Imports
import UserDetails from 'src/views/pages/home/UserDetails'

// ** Third Party Imports
import axios from 'axios'

const Home = () => {
  const [studentCount, setStudentCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [premiumCount, setPremiumCount] = useState(0)
  const [visitorCount, setVisitorCount] = useState(0)
  const [adminCount, setAdminCount] = useState(0)
  const [baoCount, setBaoCount] = useState(0)
  const [guardCount, setGuardCount] = useState(0)
  const [violationCount, setViolationCount] = useState(0)
  const [userRFIDCount, setUserRFIDCount] = useState(0)

  // ** Hooks
  const ability = useContext(AbilityContext)

  const fetchStudents = () => {
    axios
      .get('/api/user/count/student')
      .then(response => {
        setStudentCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchStaffs = () => {
    axios
      .get('/api/user/count/staff')
      .then(response => {
        setStaffCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchPremiums = () => {
    axios
      .get('/api/premium/count')
      .then(response => {
        setPremiumCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchVisitors = () => {
    axios
      .get('/api/visitor/count')
      .then(response => {
        setVisitorCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchAdmins = () => {
    axios
      .get('/api/admin/count')
      .then(response => {
        setAdminCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchBAOs = () => {
    axios
      .get('/api/bao/count')
      .then(response => {
        setBaoCount(response.data)
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
      .get('/api/violations/count')
      .then(response => {
        setViolationCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchUserRFIDCount = () => {
    axios
      .get('/api/logs/count')
      .then(response => {
        setUserRFIDCount(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents()
    fetchStaffs()
    fetchPremiums()
    fetchVisitors()
    fetchAdmins()
    fetchBAOs()
    fetchGuards()

    fetchViolations()
    fetchUserRFIDCount()
  }, [])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Grid container spacing={3}>
          {ability?.can('read', 'total_admins') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails icon='mdi:account-eye' color='primary' count={adminCount} title='Total Admins' />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_baos') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails icon='mdi:account-cash' color='primary' count={baoCount} title='Total BAOs' />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_guards') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails
                icon='mdi:account-tie-hat'
                color='primary'
                count={guardCount}
                title='Total Security Guards'
              />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_users') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails
                icon='mdi:account-group-outline'
                color='primary'
                count={studentCount}
                title='Total Students'
              />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_staffs') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails icon='mdi:account-group-outline' color='primary' count={staffCount} title='Total Staffs' />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_premiums') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails
                icon='mdi:account-group-outline'
                color='primary'
                count={premiumCount}
                title='Total Premiums'
              />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_visitors') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails
                icon='mdi:account-group-outline'
                color='primary'
                count={visitorCount}
                title='Total Visitors'
              />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_vehicles') ? (
            <Grid item xs={12} sm={4}>
              <UserDetails icon='mdi:car-back' color='primary' count={visitorCount} title='Total Vehicles' />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_scans') ? (
            <Grid item xs={12} md={4}>
              <UserDetails
                icon='mdi:card-multiple-outline'
                color='success'
                count={userRFIDCount}
                title='Total RFID Scanned'
              />
            </Grid>
          ) : null}

          {ability?.can('read', 'total_violations') ? (
            <Grid item xs={12} md={3}>
              <UserDetails icon='mdi:alert-outline' color='warning' count={violationCount} title='Total Violations' />
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  )
}

Home.acl = {
  action: 'read',
  subject: 'home'
}

export default Home

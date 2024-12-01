// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import axios from 'axios'
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid'
import Typography from '@mui/material/Typography'

function StudentToolbar(props) {
  const { setStudentRows } = props

  // Refresh list of logs
  const fetchStudentLogs = () => {
    const userType = 'Student'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setStudentRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
        <GridToolbarExport style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchStudentLogs()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

function StaffToolbar(props) {
  const { setStaffRows } = props

  // Refresh list of logs
  const fetchStaffLogs = () => {
    const userType = 'Staff'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setStaffRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
        <GridToolbarExport style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchStaffLogs()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

function PremiumToolbar(props) {
  const { setPremiumRows } = props

  // Refresh list of logs
  const fetchPremiumLogs = () => {
    const userType = 'Premium'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setPremiumRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
        <GridToolbarExport style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchPremiumLogs()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

function VisitorToolbar(props) {
  const { setVisitorRows } = props

  // Refresh list of logs
  const fetchVisitorLogs = () => {
    const userType = 'Visitor'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setVisitorRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
        <GridToolbarExport style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchVisitorLogs()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const Logs = () => {
  // ** States
  const [studentPaginationModel, setStudentPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [studentRows, setStudentRows] = useState([])
  const [staffPaginationModel, setStaffPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [staffRows, setStaffRows] = useState([])
  const [premiumPaginationModel, setPremiumPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [premiumRows, setPremiumRows] = useState([])
  const [visitorPaginationModel, setVisitorPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [visitorRows, setVisitorRows] = useState([])

  // Refresh list of Student logs
  const fetchStudentLogs = () => {
    const userType = 'Student'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setStudentRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Refresh list of Staff logs
  const fetchStaffLogs = () => {
    const userType = 'Staff'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setStaffRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Refresh list of Premium logs
  const fetchPremiumLogs = () => {
    const userType = 'Premium'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setPremiumRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Refresh list of Visitor logs
  const fetchVisitorLogs = () => {
    const userType = 'Visitor'
    axios
      .get(`/api/logs/${userType}`)
      .then(response => {
        setVisitorRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchStudentLogs()
    fetchStaffLogs()
    fetchPremiumLogs()
    fetchVisitorLogs()
  }, [])

  const studentColumns = [
    {
      flex: 0.1,
      minWidth: 200,
      field: 'fullName',
      headerName: 'User',
      valueGetter: params => params.row.user_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.user_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'guard_name',
      headerName: 'Security Guard on Duty',
      valueGetter: params => params.row.guard_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.guard_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_in',
      headerName: 'Time In',
      valueGetter: params => params.row.timestamp_in,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_in}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_out',
      headerName: 'Time Out',
      valueGetter: params => params.row.timestamp_out,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_out}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'duration',
      headerName: 'Duration',
      valueGetter: params => params.row.duration,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.duration}
        </Typography>
      )
    }
  ]

  const staffColumns = [
    {
      flex: 0.1,
      minWidth: 200,
      field: 'fullName',
      headerName: 'User',
      valueGetter: params => params.row.user_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.user_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'guard_name',
      headerName: 'Security Guard on Duty',
      valueGetter: params => params.row.guard_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.guard_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_in',
      headerName: 'Time In',
      valueGetter: params => params.row.timestamp_in,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_in}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_out',
      headerName: 'Time Out',
      valueGetter: params => params.row.timestamp_out,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_out}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'duration',
      headerName: 'Duration',
      valueGetter: params => params.row.duration,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.duration}
        </Typography>
      )
    }
  ]

  const premiumColumns = [
    {
      flex: 0.1,
      minWidth: 200,
      field: 'fullName',
      headerName: 'User',
      valueGetter: params => params.row.user_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.user_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'guard_name',
      headerName: 'Security Guard on Duty',
      valueGetter: params => params.row.guard_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.guard_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_in',
      headerName: 'Time In',
      valueGetter: params => params.row.timestamp_in,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_in}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_out',
      headerName: 'Time Out',
      valueGetter: params => params.row.timestamp_out,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_out}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'duration',
      headerName: 'Duration',
      valueGetter: params => params.row.duration,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.duration}
        </Typography>
      )
    }
  ]

  const visitorColumns = [
    {
      flex: 0.1,
      minWidth: 200,
      field: 'fullName',
      headerName: 'User',
      valueGetter: params => params.row.user_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.user_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'guard_name',
      headerName: 'Security Guard on Duty',
      valueGetter: params => params.row.guard_full_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.guard_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_in',
      headerName: 'Time In',
      valueGetter: params => params.row.timestamp_in,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_in}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'timestamp_out',
      headerName: 'Time Out',
      valueGetter: params => params.row.timestamp_out,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_out}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'duration',
      headerName: 'Duration',
      valueGetter: params => params.row.duration,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.duration}
        </Typography>
      )
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Student Logs' />
          <DataGrid
            autoHeight
            columns={studentColumns}
            rows={studentRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={studentPaginationModel}
            slots={{ toolbar: StudentToolbar }}
            onPaginationModelChange={setStudentPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setStudentRows
              }
            }}
          />
        </Card>
      </Grid>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Staff Logs' />
          <DataGrid
            autoHeight
            columns={staffColumns}
            rows={staffRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={staffPaginationModel}
            slots={{ toolbar: StaffToolbar }}
            onPaginationModelChange={setStaffPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setStaffRows
              }
            }}
          />
        </Card>
      </Grid>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Premium Logs' />
          <DataGrid
            autoHeight
            columns={premiumColumns}
            rows={premiumRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={premiumPaginationModel}
            slots={{ toolbar: PremiumToolbar }}
            onPaginationModelChange={setPremiumPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setPremiumRows
              }
            }}
          />
        </Card>
      </Grid>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Visitor Logs' />
          <DataGrid
            autoHeight
            columns={visitorColumns}
            rows={visitorRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={visitorPaginationModel}
            slots={{ toolbar: VisitorToolbar }}
            onPaginationModelChange={setVisitorPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setVisitorRows
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

Logs.acl = {
  action: 'read',
  subject: 'logs'
}

export default Logs

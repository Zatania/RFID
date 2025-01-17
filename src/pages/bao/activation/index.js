// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import axios from 'axios'
import { GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid'
import Typography from '@mui/material/Typography'

// ** Views
import DialogActivateAccount from 'src/views/pages/bao/activation/DialogActivateAccount'
import DialogActivatePremiumAccount from 'src/views/pages/bao/activation/DialogActivatePremiumAccount'

function StudentStaffCustomToolbar(props) {
  const { setInactiveStudentStaff } = props

  // Refresh list of bao's
  const fetchInactiveStudentStaff = () => {
    axios
      .get('/api/bao/inactive/user')
      .then(response => {
        setInactiveStudentStaff(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchInactiveStudentStaff()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

function PremiumCustomToolbar(props) {
  const { setInactivePremium } = props

  // Refresh list of bao's
  const fetchInactivePremium = () => {
    axios
      .get('/api/bao/inactive/premium')
      .then(response => {
        setInactivePremium(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchInactivePremium()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const BAOActivation = () => {
  // ** States
  const [inactiveStudentStaffPaginationModel, setInactiveStudentStaffPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const [inactiveStudentStaff, setInactiveStudentStaff] = useState([])

  const [inactivePremiumPaginationModel, setInactivePremiumPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const [inactivePremium, setInactivePremium] = useState([])

  // Refresh list of bao's
  const fetchInactiveStudentStaff = () => {
    axios
      .get('/api/bao/inactive/user')
      .then(response => {
        setInactiveStudentStaff(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchInactivePremium = () => {
    axios
      .get('/api/bao/inactive/premium')
      .then(response => {
        setInactivePremium(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchInactiveStudentStaff()
    fetchInactivePremium()
  }, [])

  const inactiveStudentStaffColumn = [
    {
      flex: 0.2,
      minWidth: 150,
      field: 'full_name',
      headerName: 'Full Name',
      valueGetter: params => params.row.first_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.first_name} {params.row.middle_name || ''} {params.row.last_name}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'load_balance',
      headerName: 'Load Balance',
      valueGetter: params => params.row.load_balance,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.load_balance}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'status',
      headerName: 'Status',
      valueGetter: params => params.row.status,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.status || 'N/A'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'action',
      headerName: 'Actions',
      filterable: false,
      renderCell: params => {
        return <DialogActivateAccount account={params.row} refreshData={fetchInactiveStudentStaff} />
      }
    }
  ]

  const inactivePremiumColumn = [
    {
      flex: 0.2,
      minWidth: 150,
      field: 'full_name',
      headerName: 'Full Name',
      valueGetter: params => params.row.first_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.first_name} {params.row.middle_name || ''} {params.row.last_name}
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
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'start_date',
      headerName: 'Start Date',
      valueGetter: params => params.row.start_date,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.start_date}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'end_date',
      headerName: 'End Date',
      valueGetter: params => params.row.end_date,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.end_date}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'status',
      headerName: 'Status',
      valueGetter: params => params.row.status,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.status || 'N/A'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'action',
      headerName: 'Actions',
      filterable: false,
      renderCell: params => {
        return <DialogActivatePremiumAccount account={params.row} refreshData={fetchInactivePremium} />
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Inactive Student/Employee Accounts' />
          <DataGrid
            autoHeight
            columns={inactiveStudentStaffColumn}
            rows={inactiveStudentStaff}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={inactiveStudentStaffPaginationModel}
            slots={{ toolbar: StudentStaffCustomToolbar }}
            onPaginationModelChange={setInactiveStudentStaffPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setInactiveStudentStaff
              }
            }}
          />
        </Card>
      </Grid>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Inactive Premium Accounts' />
          <DataGrid
            autoHeight
            columns={inactivePremiumColumn}
            rows={inactivePremium}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={inactivePremiumPaginationModel}
            slots={{ toolbar: PremiumCustomToolbar }}
            onPaginationModelChange={setInactivePremiumPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setInactivePremium
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

BAOActivation.acl = {
  action: 'read',
  subject: 'bao-activation'
}

export default BAOActivation

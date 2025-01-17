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
import DialogTopupAccount from 'src/views/pages/bao/topup/DialogTopupAccount'
import DialogRenewPremiumAccount from 'src/views/pages/bao/renewal/DialogRenewPremiumAccount'

function StudentStaffCustomToolbar(props) {
  const { setStudentStaff } = props

  // Refresh list of bao's
  const fetchStudentStaff = () => {
    axios
      .get('/api/bao/active/user')
      .then(response => {
        setStudentStaff(response.data)
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
          onClick={() => fetchStudentStaff()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

function PremiumCustomToolbar(props) {
  const { setPremium } = props

  // Refresh list of bao's
  const fetchPremium = () => {
    axios
      .get('/api/bao/active/premium')
      .then(response => {
        setPremium(response.data)
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
          onClick={() => fetchPremium()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

function ExpiredPremiumCustomToolbar(props) {
  const { setExpiredPremium } = props

  // Refresh list of bao's
  const fetchExpiredPremium = () => {
    axios
      .get('/api/bao/expired/premium')
      .then(response => {
        setExpiredPremium(response.data)
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
          onClick={() => fetchExpiredPremium()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const BAOAccounts = () => {
  // ** States
  const [studentStaffPaginationModel, setStudentStaffPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [studentStaff, setStudentStaff] = useState([])
  const [premiumPaginationModel, setPremiumPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [premium, setPremium] = useState([])
  const [expiredPremiumPaginationModel, setExpiredPremiumPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [expiredPremium, setExpiredPremium] = useState([])

  // Refresh list of bao's
  const fetchStudentStaff = () => {
    axios
      .get('/api/bao/active/user')
      .then(response => {
        setStudentStaff(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchPremium = () => {
    axios
      .get('/api/bao/active/premium')
      .then(response => {
        setPremium(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  const fetchExpiredPremium = () => {
    axios
      .get('/api/bao/expired/premium')
      .then(response => {
        setExpiredPremium(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchStudentStaff()
    fetchPremium()
    fetchExpiredPremium()
  }, [])

  const studentStaffColumn = [
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
        return <DialogTopupAccount account={params.row} refreshData={fetchStudentStaff} />
      }
    }
  ]

  const premiumColumn = [
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
    }
  ]

  const expiredPremiumColumn = [
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
        return <DialogRenewPremiumAccount account={params.row} refreshData={fetchExpiredPremium} />
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Active Student/Employee Accounts' />
          <DataGrid
            autoHeight
            columns={studentStaffColumn}
            rows={studentStaff}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={studentStaffPaginationModel}
            slots={{ toolbar: StudentStaffCustomToolbar }}
            onPaginationModelChange={setStudentStaffPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setStudentStaff
              }
            }}
          />
        </Card>
      </Grid>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Active Premium Accounts' />
          <DataGrid
            autoHeight
            columns={premiumColumn}
            rows={premium}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={premiumPaginationModel}
            slots={{ toolbar: PremiumCustomToolbar }}
            onPaginationModelChange={setPremiumPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setPremium
              }
            }}
          />
        </Card>
      </Grid>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Expired Premium Accounts' />
          <DataGrid
            autoHeight
            columns={expiredPremiumColumn}
            rows={expiredPremium}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={expiredPremiumPaginationModel}
            slots={{ toolbar: ExpiredPremiumCustomToolbar }}
            onPaginationModelChange={setExpiredPremiumPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setExpiredPremium
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

BAOAccounts.acl = {
  action: 'read',
  subject: 'bao-accounts'
}

export default BAOAccounts

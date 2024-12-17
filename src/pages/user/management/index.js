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
import Tooltip from '@mui/material/Tooltip'

// ** Views
import DialogAddUser from 'src/views/pages/user/management/DialogAddUser'
import DialogViewUser from 'src/views/pages/user/management/DialogViewUser'
import DialogDeleteUser from 'src/views/pages/user/management/DialogDeleteUser'
import DialogViewVehicles from 'src/views/pages/user/vehicles/management/DialogViewVehicles'

function CustomToolbar(props) {
  const { setUserRows } = props

  // Refresh list of users
  const fetchUsers = () => {
    axios
      .get('/api/user')
      .then(response => {
        setUserRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <DialogAddUser refreshData={fetchUsers} />
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchUsers()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const UserManagement = () => {
  // ** States
  const [userPaginationModel, setUserPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [userRows, setUserRows] = useState([])

  // Refresh list of users
  const fetchUsers = () => {
    axios
      .get('/api/user')
      .then(response => {
        setUserRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const userColumn = [
    {
      flex: 0.1,
      minWidth: 100,
      field: 'fullName',
      headerName: 'Full Name',
      valueGetter: params => params.row.first_name + ' ' + params.row.last_name,
      renderCell: params => (
        <Tooltip title={params.row.first_name + ' ' + params.row.last_name}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.first_name + ' ' + params.row.last_name}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'load_balance',
      headerName: 'Load Balance',
      valueGetter: params => params.row.load_balance,
      renderCell: params => (
        <Tooltip title={params.row.load_balance}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.load_balance}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'status',
      headerName: 'Status',
      valueGetter: params => params.row.status,
      renderCell: params => (
        <Tooltip title={params.row.status}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.status}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.3,
      minWidth: 300,
      field: 'action',
      headerName: 'Actions',
      filterable: false,
      renderCell: params => {
        return (
          <>
            <DialogViewUser user={params.row} users={userRows} refreshData={fetchUsers} />
            <DialogViewVehicles user_id={params.row.id} refreshData={fetchUsers} />
            <DialogDeleteUser user_id={params.row.id} refreshData={fetchUsers} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Users' />
          <DataGrid
            autoHeight
            columns={userColumn}
            rows={userRows}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={userPaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setUserPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setUserRows
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

UserManagement.acl = {
  action: 'read',
  subject: 'user-management'
}

export default UserManagement

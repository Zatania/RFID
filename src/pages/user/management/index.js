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

// ** Views
import DialogAddUser from 'src/views/pages/user/management/DialogAddUser'
import DialogEditUser from 'src/views/pages/user/management/DialogEditUser'
import DialogDeleteUser from 'src/views/pages/user/management/DialogDeleteUser'

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
      minWidth: 200,
      field: 'fullName',
      headerName: 'Full Name',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.first_name + ' ' + params.row.middle_name + ' ' + params.row.last_name}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'phone',
      headerName: 'Phone Number',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.phone}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'address',
      headerName: 'Address',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.address}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'rfid',
      headerName: 'RFID Number',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.rfid}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_maker',
      headerName: 'Vehicle Maker',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.vehicle_maker}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_model',
      headerName: 'Vehicle Model',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.vehicle_model}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_color',
      headerName: 'Vehicle Color',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.vehicle_color}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_plate_number',
      headerName: 'Vehicle Plate Number',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.vehicle_plate_number}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'action',
      headerName: 'Actions',
      renderCell: params => {
        return (
          <>
            <DialogEditUser user={params.row} refreshData={fetchUsers} />
            <DialogDeleteUser user_id={params.row.user_id} refreshData={fetchUsers} />
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
            getRowId={row => row.user_id}
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

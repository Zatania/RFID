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
import DialogAddAdmin from 'src/views/pages/admin/management/DialogAddAdmin'
import DialogEditAdmin from 'src/views/pages/admin/management/DialogEditAdmin'
import DialogDeleteAdmin from 'src/views/pages/admin/management/DialogDeleteAdmin'

function CustomToolbar(props) {
  const { setAdminRows } = props

  const fetchAdmins = () => {
    axios
      .get('/api/admin')
      .then(response => {
        setAdminRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <DialogAddAdmin refreshData={fetchAdmins} />
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchAdmins()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const AdminManagement = () => {
  // ** States
  const [adminPaginationModel, setAdminPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [adminRows, setAdminRows] = useState([])

  const fetchAdmins = () => {
    axios
      .get('/api/admin')
      .then(response => {
        setAdminRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchAdmins()
  }, [])

  const adminColumn = [
    {
      flex: 0.2,
      minWidth: 150,
      field: 'firstName',
      headerName: 'First Name',
      valueGetter: params => params.row.first_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.first_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'middleName',
      headerName: 'Middle Name',
      valueGetter: params => params.row.middle_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.middle_name || 'N/A'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'lastName',
      headerName: 'Last Name',
      valueGetter: params => params.row.last_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.last_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'username',
      headerName: 'Username',
      valueGetter: params => params.row.username,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.username}
        </Typography>
      )
    },
    {
      flex: 0.3,
      minWidth: 300,
      field: 'action',
      headerName: 'Actions',
      renderCell: params => {
        return (
          <>
            <DialogEditAdmin admin={params.row} refreshData={fetchAdmins} />
            <DialogDeleteAdmin admin_id={params.row.admin_id} refreshData={fetchAdmins} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Admins' />
          <DataGrid
            autoHeight
            columns={adminColumn}
            rows={adminRows}
            getRowId={row => row.admin_id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={adminPaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setAdminPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setAdminRows
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

AdminManagement.acl = {
  action: 'read',
  subject: 'admin-management'
}

export default AdminManagement

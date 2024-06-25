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
import DialogAddGuard from 'src/views/pages/guard/management/DialogAddGuard'
import DialogEditGuard from 'src/views/pages/guard/management/DialogEditGuard'
import DialogDeleteGuard from 'src/views/pages/guard/management/DialogDeleteGuard'

function CustomToolbar(props) {
  const { setGuardRows } = props

  // Refresh list of guards
  const fetchGuards = () => {
    axios
      .get('/api/guard')
      .then(response => {
        setGuardRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <DialogAddGuard refreshData={fetchGuards} />
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchGuards()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const GuardManagement = () => {
  // ** States
  const [guardPaginationModel, setGuardPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [guardRows, setGuardRows] = useState([])

  // Refresh list of guards
  const fetchGuards = () => {
    axios
      .get('/api/guard')
      .then(response => {
        setGuardRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchGuards()
  }, [])

  const guardColumn = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'fullName',
      headerName: 'Full Name',
      valueGetter: params => params.row.first_name + ' ' + (params.row.middle_name || '') + ' ' + params.row.last_name,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.first_name + ' ' + (params.row.middle_name || '') + ' ' + params.row.last_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'phone',
      headerName: 'Phone Number',
      valueGetter: params => params.row.phone,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.phone}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'address',
      headerName: 'Address',
      valueGetter: params => params.row.address,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.address}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
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
      flex: 0.2,
      minWidth: 250,
      field: 'action',
      headerName: 'Actions',
      renderCell: params => {
        return (
          <>
            <DialogEditGuard guard={params.row} refreshData={fetchGuards} />
            <DialogDeleteGuard guard_id={params.row.guard_id} refreshData={fetchGuards} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Security Guards' />
          <DataGrid
            autoHeight
            columns={guardColumn}
            rows={guardRows}
            getRowId={row => row.guard_id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={guardPaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setGuardPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setGuardRows
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

GuardManagement.acl = {
  action: 'read',
  subject: 'guard-management'
}

export default GuardManagement

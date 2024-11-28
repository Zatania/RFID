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

function CustomToolbar(props) {
  const { setInactives } = props

  // Refresh list of bao's
  const fetchInactive = () => {
    axios
      .get('/api/bao/inactive')
      .then(response => {
        setInactives(response.data)
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
          onClick={() => fetchInactive()}
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
  const [inactivePaginationModel, setInactivePaginationModel] = useState({ page: 0, pageSize: 10 })
  const [inactives, setInactives] = useState([])

  // Refresh list of bao's
  const fetchInactive = () => {
    axios
      .get('/api/bao/inactive')
      .then(response => {
        setInactives(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchInactive()
  }, [])

  const inactiveColumn = [
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
      renderCell: params => {
        return <DialogActivateAccount account={params.row} refreshData={fetchInactive} />
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Inactive Accounts' />
          <DataGrid
            autoHeight
            columns={inactiveColumn}
            rows={inactives}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={inactivePaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setInactivePaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setInactives
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

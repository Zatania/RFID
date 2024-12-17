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

function CustomToolbar(props) {
  const { setActives } = props

  // Refresh list of bao's
  const fetchActive = () => {
    axios
      .get('/api/bao/active')
      .then(response => {
        setActives(response.data)
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
          onClick={() => fetchActive()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const BAOTopUp = () => {
  // ** States
  const [activePaginationModel, setActivePaginationModel] = useState({ page: 0, pageSize: 10 })
  const [actives, setActives] = useState([])

  // Refresh list of bao's
  const fetchActive = () => {
    axios
      .get('/api/bao/active')
      .then(response => {
        setActives(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchActive()
  }, [])

  const activeColumn = [
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
        return <DialogTopupAccount account={params.row} refreshData={fetchActive} />
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Active Accounts' />
          <DataGrid
            autoHeight
            columns={activeColumn}
            rows={actives}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={activePaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setActivePaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setActives
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

BAOTopUp.acl = {
  action: 'read',
  subject: 'bao-topup'
}

export default BAOTopUp

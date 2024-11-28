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
import Tooltip from '@mui/material/Tooltip'

// ** Views
import DialogAddPremium from 'src/views/pages/premium/management/DialogAddPremium'
import DialogViewPremium from 'src/views/pages/premium/management/DialogViewPremium'
import DialogDeletePremium from 'src/views/pages/premium/management/DialogDeletePremium'
import DialogViewVehicles from 'src/views/pages/premium/vehicles/management/DialogViewVehicles'

function CustomToolbar(props) {
  const { setPremiumRows } = props

  const fetchPremiums = () => {
    axios
      .get('/api/premium')
      .then(response => {
        setPremiumRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <DialogAddPremium refreshData={fetchPremiums} />
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchPremiums()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const PremiumManagement = () => {
  // ** States
  const [premiumPaginationModel, setPremiumPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [premiumRows, setPremiumRows] = useState([])

  const fetchPremiums = () => {
    axios
      .get('/api/premium')
      .then(response => {
        setPremiumRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchPremiums()
  }, [])

  const premiumColumns = [
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
      renderCell: params => {
        return (
          <>
            <DialogViewPremium premium={params.row} refreshData={fetchPremiums} />
            <DialogViewVehicles premium_id={params.row.id} refreshData={fetchPremiums} />
            <DialogDeletePremium premium_id={params.row.id} refreshData={fetchPremiums} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Premiums' />
          <DataGrid
            autoHeight
            columns={premiumColumns}
            rows={premiumRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={premiumPaginationModel}
            slots={{ toolbar: CustomToolbar }}
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
    </Grid>
  )
}

PremiumManagement.acl = {
  action: 'read',
  subject: 'premium-management'
}

export default PremiumManagement

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
import DialogAddVisitor from 'src/views/pages/visitor/management/DialogAddVisitor'
import DialogDeleteVisitor from 'src/views/pages/visitor/management/DialogDeleteVisitor'

function CustomToolbar(props) {
  const { setVisitorRows } = props

  const fetchVisitors = () => {
    axios
      .get('/api/visitor')
      .then(response => {
        setVisitorRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <DialogAddVisitor refreshData={fetchVisitors} />
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchVisitors()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const VisitorManagement = () => {
  // ** States
  const [visitorPaginationModel, setVisitorPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [visitorRows, setVisitorRows] = useState([])

  const fetchVisitors = () => {
    axios
      .get('/api/visitor')
      .then(response => {
        setVisitorRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchVisitors()
  }, [])

  const visitorColumn = [
    {
      flex: 0.1,
      minWidth: 150,
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
      minWidth: 150,
      field: 'purpose',
      headerName: 'Purpose',
      valueGetter: params => params.row.purpose,
      renderCell: params => (
        <Tooltip title={params.row.purpose}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.purpose}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_maker',
      headerName: 'Vehicle Maker',
      valueGetter: params => params.row.vehicle_maker,
      renderCell: params => (
        <Tooltip title={params.row.vehicle_maker}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.vehicle_maker}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_model',
      headerName: 'Vehicle Model',
      valueGetter: params => params.row.vehicle_model,
      renderCell: params => (
        <Tooltip title={params.row.vehicle_model}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.vehicle_model}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'vehicle_color',
      headerName: 'Vehicle Color',
      valueGetter: params => params.row.vehicle_color,
      renderCell: params => (
        <Tooltip title={params.row.vehicle_color}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.vehicle_color}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'vehicle_plate_number',
      headerName: 'Vehicle Plate Number',
      valueGetter: params => params.row.vehicle_plate_number,
      renderCell: params => (
        <Tooltip title={params.row.vehicle_plate_number}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.vehicle_plate_number}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
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
      flex: 0.2,
      minWidth: 150,
      field: 'action',
      headerName: 'Actions',
      renderCell: params => {
        return (
          <>
            <DialogDeleteVisitor visitor_id={params.row.id} refreshData={fetchVisitors} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Visitors' />
          <DataGrid
            autoHeight
            columns={visitorColumn}
            rows={visitorRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={visitorPaginationModel}
            slots={{ toolbar: CustomToolbar }}
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

VisitorManagement.acl = {
  action: 'read',
  subject: 'visitor-management'
}

export default VisitorManagement

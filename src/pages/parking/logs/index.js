// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

const ParkingLogs = () => {
  // ** States
  const [parkingLogsPaginationModel, setParkingLogsPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [parkingLogsRows, setParkingLogsRows] = useState([])

  const fetchParkingLogs = () => {
    axios
      .get('/api/logs/daily')
      .then(response => {
        setParkingLogsRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchParkingLogs()
  }, [])

  const parkingLogsColumn = [
    {
      flex: 0.2,
      minWidth: 120,
      field: 'fullName',
      headerName: 'Full Name',
      valueGetter: params => params.row.account_name,
      renderCell: params => (
        <Tooltip title={params.row.account_name}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.account_name}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'date',
      headerName: 'Date',
      valueGetter: params => params.row.created_at,
      renderCell: params => (
        <Tooltip title={params.row.created_at}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.created_at}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'action',
      headerName: 'Action',
      valueGetter: params => params.row.action,
      renderCell: params => (
        <Tooltip title={params.row.action}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.action}
          </Typography>
        </Tooltip>
      )
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Parking Logs' />
          <DataGrid
            autoHeight
            getRowId={row => row.log_id}
            columns={parkingLogsColumn}
            rows={parkingLogsRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={parkingLogsPaginationModel}
            onPaginationModelChange={setParkingLogsPaginationModel}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

ParkingLogs.acl = {
  action: 'read',
  subject: 'parking-logs'
}

export default ParkingLogs

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

const ParkingMonitoring = () => {
  // ** States
  const [parkingMonitoringPaginationModel, setParkingMonitoringPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [parkingMonitoringRows, setParkingMonitoringRows] = useState([])

  const fetchParkingMonitoring = () => {
    axios
      .get('/api/logs/realtime')
      .then(response => {
        setParkingMonitoringRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchParkingMonitoring()

    const realtimeSocket = new WebSocket('ws://localhost:4000/realtime')
    realtimeSocket.addEventListener('message', event => {
      const realtimeData = JSON.parse(event.data)
      setParkingMonitoringRows(realtimeData)
    })

    return () => {
      realtimeSocket.close()
    }
  }, [])

  const parkingMonitoringColumns = [
    {
      flex: 0.2,
      minWidth: 120,
      field: 'fullName',
      headerName: 'Full Name',
      valueGetter: params => params.row.full_name,
      renderCell: params => (
        <Tooltip title={params.row.full_name}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.full_name}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'plateNumber',
      headerName: 'Plate Number',
      valueGetter: params => params.row.plate_number,
      renderCell: params => (
        <Tooltip title={params.row.plate_number}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.plate_number}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'timeIN',
      headerName: 'Time IN',
      valueGetter: params => params.row.time_in,
      renderCell: params => (
        <Tooltip title={params.row.time_in}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.time_in}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'parkingTime',
      headerName: 'Parking Time',
      valueGetter: params => params.row.elapsed_time,
      renderCell: params => (
        <Tooltip title={params.row.elapsed_time}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.elapsed_time}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'currentStatus',
      headerName: 'Status',
      valueGetter: params => params.row.status,
      renderCell: params => (
        <Tooltip title={params.row.status}>
          <Typography
            variant='body2'
            sx={{
              color: params.row.status === 'Overparked' ? 'red' : 'text.primary',
              fontWeight: params.row.status === 'Overparked' ? 'bold' : 'normal'
            }}
          >
            {params.row.status}
          </Typography>
        </Tooltip>
      )
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Visitors' />
          <DataGrid
            autoHeight
            getRowId={row => row.history_id}
            columns={parkingMonitoringColumns}
            rows={parkingMonitoringRows}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={parkingMonitoringPaginationModel}
            onPaginationModelChange={setParkingMonitoringPaginationModel}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

ParkingMonitoring.acl = {
  action: 'read',
  subject: 'parking-monitoring'
}

export default ParkingMonitoring

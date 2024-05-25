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

function CustomToolbar(props) {
  const { setLogsRow } = props

  // Refresh list of logs
  const fetchLogs = () => {
    axios
      .get('/api/user/logs')
      .then(response => {
        setLogsRow(response.data)
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
          onClick={() => fetchLogs()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const UserLogs = () => {
  // ** States
  const [logPaginationModel, setLogPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [logsRow, setLogsRow] = useState([])

  // Refresh list of logs
  const fetchLogs = () => {
    axios
      .get('/api/user/logs')
      .then(response => {
        setLogsRow(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchLogs()
  }, [])

  const logsColumn = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'fullName',
      headerName: 'User',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.user_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'guard_name',
      headerName: 'Security Guard on Duty',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.guard_full_name}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'timestamp_in',
      headerName: 'Time In',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_in}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'timestamp_out',
      headerName: 'Time Out',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp_out}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'duration',
      headerName: 'Duration',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.duration}
        </Typography>
      )
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='User RFID Logs' />
          <DataGrid
            autoHeight
            columns={logsColumn}
            rows={logsRow}
            getRowId={row => row.log_id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={logPaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setLogPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setLogsRow
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

UserLogs.acl = {
  action: 'read',
  subject: 'user-logs'
}

export default UserLogs

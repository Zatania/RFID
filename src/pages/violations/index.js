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
import Tooltip from '@mui/material/Tooltip'

import DialogViewViolation from 'src/views/pages/user/violation/DialogViewViolation'

function CustomToolbar(props) {
  const { setViolationRows } = props

  // Refresh list of violations
  const fetchViolations = () => {
    axios
      .get('/api/violations')
      .then(response => {
        setViolationRows(response.data)
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
          onClick={() => fetchViolations()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const UserViolations = () => {
  // ** States
  const [violationPaginationModel, setViolationPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [violationsRow, setViolationRows] = useState([])

  // Refresh list
  const fetchViolations = () => {
    axios
      .get('/api/violations')
      .then(response => {
        setViolationRows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchViolations()
  }, [])

  const violationsColumn = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'full_name',
      headerName: 'User',
      valueGetter: params => `${params.row.full_name}`,
      renderCell: params => (
        <Tooltip title={params.full_name}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.full_name}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'timestamp',
      headerName: 'Date & Time of Violation',
      valueGetter: params => `${params.row.timestamp}`,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.timestamp}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'status',
      headerName: 'Status',
      valueGetter: params => `${params.row.status}`,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.status}
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
            <DialogViewViolation violation={params.row} refreshData={fetchViolations} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Violations' />
          <DataGrid
            autoHeight
            columns={violationsColumn}
            rows={violationsRow}
            getRowId={row => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={violationPaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setViolationPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setViolationRows
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

UserViolations.acl = {
  action: 'read',
  subject: 'user-violations'
}

export default UserViolations

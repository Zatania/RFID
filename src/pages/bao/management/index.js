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
import DialogAddBAO from 'src/views/pages/bao/management/DialogAddBAO'
import DialogEditBAO from 'src/views/pages/bao/management/DialogEditBAO'
import DialogDeleteBAO from 'src/views/pages/bao/management/DialogDeleteBAO'

function CustomToolbar(props) {
  const { setBAORows } = props

  // Refresh list of bao's
  const fetchBAO = () => {
    axios
      .get('/api/bao')
      .then(response => {
        setBAORows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <DialogAddBAO refreshData={fetchBAO} />
        <GridToolbarFilterButton style={{ marginRight: '8px', marginBottom: '8px' }} />
      </div>
      <div>
        <Button
          size='small'
          variant='outlined'
          style={{ marginLeft: '8px', marginRight: '8px', marginBottom: '8px' }}
          onClick={() => fetchBAO()}
        >
          Refresh
        </Button>
        <GridToolbarQuickFilter style={{ marginBottom: '8px' }} />
      </div>
    </GridToolbarContainer>
  )
}

const BAOManagement = () => {
  // ** States
  const [baoPaginationModel, setBaoPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [baoRows, setBAORows] = useState([])

  // Refresh list of bao's
  const fetchBAO = () => {
    axios
      .get('/api/bao')
      .then(response => {
        setBAORows(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchBAO()
  }, [])

  const baoColumn = [
    {
      flex: 0.2,
      minWidth: 200,
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
      minWidth: 200,
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
      minWidth: 200,
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
            <DialogEditBAO bao={params.row} refreshData={fetchBAO} />
            <DialogDeleteBAO bao_id={params.row.bao_id} refreshData={fetchBAO} />
          </>
        )
      }
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='BAOs' />
          <DataGrid
            autoHeight
            columns={baoColumn}
            rows={baoRows}
            getRowId={row => row.bao_id}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={baoPaginationModel}
            slots={{ toolbar: CustomToolbar }}
            onPaginationModelChange={setBaoPaginationModel}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              toolbar: {
                setBAORows
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

BAOManagement.acl = {
  action: 'read',
  subject: 'bao-management'
}

export default BAOManagement

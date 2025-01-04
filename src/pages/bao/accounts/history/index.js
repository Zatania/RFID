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

const AccountsHistory = () => {
  // ** States
  const [topupHistoryPaginationModel, setTopUpHistoryPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [topupHistory, setTopUpHistory] = useState([])

  const fetchTopUpHistory = () => {
    axios
      .get('/api/bao/topup/history')
      .then(response => {
        setTopUpHistory(response.data)
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchTopUpHistory()
  }, [])

  const topupHistoryColumns = [
    {
      flex: 0.2,
      minWidth: 120,
      field: 'fullName',
      headerName: 'Full Name',
      sortable: false,
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
      field: 'bao',
      headerName: 'BAO In Charge',
      sortable: false,
      valueGetter: params => params.row.bao,
      renderCell: params => (
        <Tooltip title={params.row.bao}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.bao}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'load_amount',
      headerName: 'Load Amount',
      sortable: false,
      valueGetter: params => params.row.load_amount,
      renderCell: params => (
        <Tooltip title={params.row.load_amount}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.load_amount}
          </Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'created_by',
      headerName: 'Date and Time',
      valueGetter: params => params.row.created_by,
      renderCell: params => (
        <Tooltip title={params.row.created_by}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.created_by}
          </Typography>
        </Tooltip>
      )
    }
  ]

  return (
    <Grid container spacing={8}>
      <Grid item sm={12} xs={12} sx={{ width: '100%' }}>
        <Card>
          <CardHeader title='Top Up History' />
          <DataGrid
            autoHeight
            columns={topupHistoryColumns}
            rows={topupHistory}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={topupHistoryPaginationModel}
            onPaginationModelChange={setTopUpHistoryPaginationModel}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

AccountsHistory.acl = {
  action: 'read',
  subject: 'bao-accounts-history'
}

export default AccountsHistory

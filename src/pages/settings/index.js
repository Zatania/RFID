// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import { CardHeader } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
  useGridApiRef
} from '@mui/x-data-grid'

// ** Third Party Components
import axios from 'axios'
import toast from 'react-hot-toast'

const SystemSettings = () => {
  // ** States
  const [settings, setSettings] = useState([])
  const [settingsPaginationModel, setSettingsPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [rowModesModel, setRowModesModel] = useState({})
  const apiRef = useGridApiRef()

  // Fetch system settings from backend
  const fetchSettings = () => {
    axios
      .get('/api/settings')
      .then(response => {
        setSettings(response.data) // Populate the settings state
      })
      .catch(error => console.error('Error fetching data', error))
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = id => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const handleSaveClick = id => () => {
    apiRef.current.stopRowEditMode({ id }) // Trigger `processRowUpdate`
  }

  const handleCancelClick = id => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    })

    const editedRow = settings.find(row => row.id === id)
    if (editedRow.isNew) {
      setSettings(settings.filter(row => row.id !== id))
    }
  }

  const processRowUpdate = async (updatedRow, originalRow) => {
    try {
      // Send the updated row data to the server
      const response = await axios.put(`/api/settings`, {
        id: updatedRow.id,
        setting_value: updatedRow.setting_value,
        description: updatedRow.description
      })

      if (response.status === 200) {
        // Update the settings state with the server's response
        setSettings(prevSettings =>
          prevSettings.map(row => (row.id === updatedRow.id ? { ...row, ...response.data } : row))
        )
        toast.success(response.data.message || 'Data saved successfully.')

        return response.data // Return updated row
      } else {
        toast.error(response.data.message || 'Failed to save data.')
        throw new Error('Save failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred.')

      return originalRow // Revert to original row
    }
  }

  const handleRowModesModelChange = newRowModesModel => {
    setRowModesModel(newRowModesModel)
  }

  // Columns for the DataGrid
  const columns = [
    { field: 'setting_key', headerName: 'System Key', width: 150, sortable: false },
    { field: 'setting_value', headerName: 'Value', width: 100, editable: true, type: 'number', sortable: false },
    {
      field: 'description',
      headerName: 'Description',
      width: 600,
      editable: true,
      sortable: false,
      renderCell: params => (
        <Tooltip title={params.row.description} placement='bottom-start'>
          <span>{params.row.description}</span>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      filterable: false,
      width: 100,
      cellClassName: 'actions',
      sortable: false,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return [
            <>
              <GridActionsCellItem
                icon={<SaveIcon />}
                label='Save'
                sx={{
                  color: 'primary.main'
                }}
                onClick={handleSaveClick(id)}
              />
              ,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label='Cancel'
                className='textPrimary'
                onClick={handleCancelClick(id)}
                color='inherit'
              />
            </>
          ]
        }

        return [
          <>
            <GridActionsCellItem
              icon={<EditIcon />}
              label='Edit'
              className='textPrimary'
              onClick={handleEditClick(id)}
              color='inherit'
            />
          </>
        ]
      }
    }
  ]

  return (
    <Box>
      <Card>
        <CardHeader title='System Settings' />
        <DataGrid
          apiRef={apiRef}
          autoHeight
          columns={columns}
          rows={settings}
          editMode='row'
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={settingsPaginationModel}
          onPaginationModelChange={setSettingsPaginationModel}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={error => toast.error('Save failed: ' + error.message)}
        />
      </Card>
    </Box>
  )
}

SystemSettings.acl = {
  action: 'read',
  subject: 'system-settings'
}

export default SystemSettings

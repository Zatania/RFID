// ** React Imports
import { useState, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import axios from 'axios'
import toast from 'react-hot-toast'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogDeleteGuard = ({ guard_id, refreshData }) => {
  const [show, setShow] = useState(false)

  const handleClose = () => {
    setShow(false)
    refreshData()
  }

  const handleDeleteClick = () => {
    axios
      .delete(`/api/guard/${guard_id}`)
      .then(() => {
        toast.success('Security Guard deleted successfully')
        handleClose()
      })
      .catch(error => {
        console.error(error)
        const errorMessage = error.response?.data?.message || 'Error deleting data'
        toast.error(errorMessage)
      })
  }

  return (
    <Box>
      <Button size='small' startIcon={<DeleteIcon />} variant='outlined' onClick={() => setShow(true)}>
        Delete
      </Button>
      <Dialog
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={handleClose}
        TransitionComponent={Transition}
        onBackdropClick={handleClose}
      >
        <DialogContent
          sx={{
            position: 'relative',
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h6' gutterBottom>
              Are you sure you want to delete this security guard?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='contained' color='error' sx={{ mr: 1 }} onClick={handleDeleteClick}>
            Delete
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DialogDeleteGuard

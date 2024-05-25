// ** React Imports
import { Ref, useState, forwardRef, ReactElement } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade, { FadeProps } from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ViewIcon from '@mui/icons-material/Visibility'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import dayjs from 'dayjs'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogViewViolation = ({ violation, refreshData }) => {
  // ** States
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState(violation.status)

  const handleClose = () => {
    setShow(false)
    refreshData()
  }

  const handleStatusChange = async event => {
    const newStatus = event.target.value
    setStatus(newStatus)
    try {
      await axios.put(`/api/user/violations/${violation.violation_id}`, { status: newStatus })
      toast.success('Violation status updated successfully.')
      handleClose()
    } catch (error) {
      toast.error('Failed to update violation status.')
    }
  }

  return (
    <Card>
      <Button size='small' startIcon={<ViewIcon />} onClick={() => setShow(true)} variant='outlined'>
        View Details
      </Button>
      <Dialog
        fullWidth
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
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
            textAlign: 'center'
          }}
        >
          <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              View Violation Details
            </Typography>
          </Box>
          <Grid container spacing={6}>
            <Grid item sm={6} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                User:
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {violation.user_full_name}
              </Typography>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Date & Time of Violation:
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {violation.timestamp}
              </Typography>
            </Grid>
            <Grid item sm={4} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Time In:
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {violation.time_in}
              </Typography>
            </Grid>
            <Grid item sm={4} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Time Out:
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {violation.time_out}
              </Typography>
            </Grid>
            <Grid item sm={4} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Duration:
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {violation.duration}
              </Typography>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Notes:
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {violation.notes}
              </Typography>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Typography variant='body2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Status:
              </Typography>
              <Select value={violation.status} onChange={handleStatusChange}>
                <MenuItem value='Unresolved'>Unresolved</MenuItem>
                <MenuItem value='Resolved'>Resolved</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default DialogViewViolation

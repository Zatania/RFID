// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components
import ChangePasswordCard from 'src/views/pages/admin/settings/security/ChangePasswordCard'

const TabSecurity = ({ admin_id }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard admin_id={admin_id} />
      </Grid>
    </Grid>
  )
}

export default TabSecurity

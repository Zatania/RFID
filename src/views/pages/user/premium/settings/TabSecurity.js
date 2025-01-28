// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components
import ChangePasswordCard from 'src/views/pages/user/premium/settings/security/ChangePasswordCard'

const TabSecurity = ({ premium_id }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard premium_id={premium_id} />
      </Grid>
    </Grid>
  )
}

export default TabSecurity

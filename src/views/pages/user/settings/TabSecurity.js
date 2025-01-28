// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components
import ChangePasswordCard from 'src/views/pages/user/settings/security/ChangePasswordCard'

const TabSecurity = ({ user_id }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard user_id={user_id} />
      </Grid>
    </Grid>
  )
}

export default TabSecurity

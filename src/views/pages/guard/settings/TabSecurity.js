// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components
import ChangePasswordCard from 'src/views/pages/guard/settings/security/ChangePasswordCard'

const TabSecurity = ({ guard_id }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard guard_id={guard_id} />
      </Grid>
    </Grid>
  )
}

export default TabSecurity

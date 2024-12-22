// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components
import ChangePasswordCard from 'src/views/pages/bao/settings/security/ChangePasswordCard'

const TabSecurity = ({ bao_id }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard bao_id={bao_id} />
      </Grid>
    </Grid>
  )
}

export default TabSecurity

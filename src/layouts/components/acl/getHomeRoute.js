/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = role => {
  if (role === 'security_guard') return '/home'
  else if (role === 'super_admin') return '/home'
  else if (role === 'admin') return '/home'
  else if (role === 'bao') return '/home'
  else if (role === 'user') return '/home'
  else if (role === 'premium') return '/home'
  else return '/login'
}

export default getHomeRoute

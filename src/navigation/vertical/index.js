const navigation = () => {
  return [
    {
      title: 'Home',
      path: '/home',
      action: 'read',
      subject: 'home',
      icon: 'mdi:home-outline'
    },
    {
      title: 'User Management',
      path: '/user/management',
      action: 'read',
      subject: 'user-management',
      icon: 'mdi:people'
    },
    {
      title: 'Premium Management',
      path: '/premium/management',
      action: 'read',
      subject: 'premium-management',
      icon: 'mdi:people'
    },
    {
      title: 'Activations',
      path: '/bao/activation',
      action: 'read',
      subject: 'bao-activation',
      icon: 'mdi:people'
    },
    {
      title: 'Account Top-Up',
      path: '/bao/topup',
      action: 'read',
      subject: 'bao-topup',
      icon: 'mdi:people'
    },
    {
      title: 'Visitor Management',
      path: '/visitor/management',
      action: 'read',
      subject: 'visitor-management',
      icon: 'mdi:account-convert'
    },
    {
      title: 'Admin Management',
      path: '/admin/management',
      action: 'read',
      subject: 'admin-management',
      icon: 'mdi:account-eye'
    },
    {
      title: 'BAO Management',
      path: '/bao/management',
      action: 'read',
      subject: 'bao-management',
      icon: 'mdi:account-cash'
    },
    {
      title: 'Guard Management',
      path: '/guard/management',
      action: 'read',
      subject: 'guard-management',
      icon: 'mdi:account-tie-hat'
    },
    {
      title: 'User Logs',
      path: '/user/logs',
      action: 'read',
      subject: 'user-logs',
      icon: 'mdi:note-multiple-outline'
    },
    {
      title: 'User Violations',
      path: '/user/violations',
      action: 'read',
      subject: 'user-violations',
      icon: 'mdi:note-alert-outline'
    },

    // Guard Page
    {
      path: '/dashboard',
      action: 'read',
      subject: 'dashboard',
      title: 'Attendance',
      icon: 'mdi:note-multiple-outline'
    }
  ]
}

export default navigation

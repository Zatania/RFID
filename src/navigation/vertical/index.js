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
      icon: 'mdi:account-badge'
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
      title: 'Activations',
      path: '/bao/activation',
      action: 'read',
      subject: 'bao-activation',
      icon: 'mdi:account-check'
    },
    {
      title: 'Accounts',
      path: '/bao/accounts',
      action: 'read',
      subject: 'bao-accounts',
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
      title: 'Visitor Management',
      path: '/visitor/management',
      action: 'read',
      subject: 'visitor-management',
      icon: 'mdi:account-convert'
    },
    {
      title: 'Accounts History',
      path: '/bao/accounts/history',
      action: 'read',
      subject: 'bao-accounts-history',
      icon: 'mdi:note-multiple-outline'
    },
    {
      title: 'Logs',
      path: '/logs',
      action: 'read',
      subject: 'logs',
      icon: 'mdi:note-multiple-outline'
    },
    {
      title: 'Parking Logs',
      path: '/parking/logs',
      action: 'read',
      subject: 'parking-logs',
      icon: 'mdi:note-multiple-outline'
    },
    {
      title: 'Currently Parked Vehicles',
      path: '/parking/monitoring',
      action: 'read',
      subject: 'parking-monitoring',
      icon: 'mdi:note-multiple-outline'
    },
    {
      title: 'Violations',
      path: '/violations',
      action: 'read',
      subject: 'violations',
      icon: 'mdi:note-alert-outline'
    },

    // Guard Page
    {
      title: 'Monitoring',
      path: '/dashboard',
      action: 'read',
      subject: 'dashboard',
      icon: 'mdi:visibility'
    },

    // Profile Page
    {
      title: 'Profile',
      path: '/user/profile',
      action: 'read',
      subject: 'profile-page',
      icon: 'mdi:account-outline'
    },

    // Settings Page
    {
      title: 'Settings',
      path: '/settings',
      action: 'read',
      subject: 'system-settings',
      icon: 'mdi:cog'
    }
  ]
}

export default navigation

const navigation = () => [
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

  /* {
    title: 'User Subscription',
    path: '/user/subscription',
    action: 'read',
    subject: 'user-subscription',
    icon: 'mdi:calendar-clock-outline'
  }, */
  {
    title: 'Guard Management',
    path: '/guard/management',
    action: 'read',
    subject: 'guard-management',
    icon: 'mdi:shield-account-outline'
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
    title: 'Attendance',
    path: '/dashboard',
    action: 'read',
    subject: 'dashboard',
    icon: 'mdi:visibility'
  }
]

export default navigation

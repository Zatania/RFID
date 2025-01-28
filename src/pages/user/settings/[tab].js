import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import AccountSettings from 'src/views/pages/user/settings/AccountSettings'

const AccountSettingsTab = ({ tab }) => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchUser = async () => {
      try {
        const user_id = session.user.id
        const response = await axios.get(`/api/user/fetch/${user_id}`)
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session])

  if (!session) return null
  if (loading) return <div>Loading...</div>

  return <AccountSettings tab={tab} user={user} />
}

export const getStaticPaths = () => {
  return {
    paths: [{ params: { tab: 'account' } }, { params: { tab: 'security' } }],
    fallback: false
  }
}

export const getStaticProps = async ({ params }) => {
  return {
    props: {
      tab: params?.tab
    }
  }
}

AccountSettingsTab.acl = {
  action: 'read',
  subject: 'user-settingstab'
}

export default AccountSettingsTab

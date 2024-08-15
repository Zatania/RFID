import db from '../db'

const deleteAdmin = async admin_id => {
  try {
    await db.query('DELETE FROM admins WHERE id = ?', [admin_id])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { admin_id } = req.query
      try {
        const admin = await deleteAdmin(admin_id)

        if (!admin) return res.status(400).json({ message: 'Failed to delete admin' })

        return res.status(200).json({ message: 'Admin deleted successfully' })
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    if (error) {
      return res.status(500).json({ message: error.message })
    } else {
      return res.status(500).json({ message: 'Something went wrong' })
    }
  }
}

export default handler

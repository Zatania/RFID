import db from '../db'

const getUserVehicles = async user_id => {
  try {
    const [user] = await db.query(
      `
      SELECT vehicles.*, rfids.value AS rfid
      FROM vehicles
      LEFT JOIN rfids ON vehicles.id = rfids.vehicle_id
      WHERE vehicles.user_id = ?
      ORDER BY vehicles.registration_expiration DESC;`,
      [user_id]
    )

    return user
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const deleteUser = async user_id => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [user_id])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { user_id } = req.query
      try {
        const user = await deleteUser(user_id)

        if (!user) return res.status(400).json({ message: 'Failed to delete user' })

        return res.status(200).json({ message: 'User deleted successfully' })
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else if (req.method === 'GET') {
      const { user_id } = req.query
      try {
        const user_vehicles = await getUserVehicles(user_id)

        if (!user_vehicles) return res.status(400).json({ message: 'Failed to fetch user vehicles' })

        return res.status(200).json(user_vehicles)
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

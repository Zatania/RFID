import db from '../db'

const getPremiumVehicles = async premium_id => {
  try {
    const [premium] = await db.query(
      `
      SELECT vehicles.*, rfids.value AS rfid
      FROM vehicles
      LEFT JOIN rfids ON vehicles.id = rfids.vehicle_id
      WHERE vehicles.premium_id = ?
      ORDER BY vehicles.registration_expiration DESC;`,
      [premium_id]
    )

    return premium
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const deletePremium = async premium_id => {
  try {
    await db.query('DELETE FROM premiums WHERE id = ?', [premium_id])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { premium_id } = req.query
      try {
        const premium = await deletePremium(premium_id)

        if (!premium) return res.status(400).json({ message: 'Failed to delete premium user' })

        return res.status(200).json({ message: 'Premium User deleted successfully' })
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else if (req.method === 'GET') {
      const { premium_id } = req.query
      try {
        const premium_vehicles = await getPremiumVehicles(premium_id)

        if (!premium_vehicles) return res.status(400).json({ message: 'Failed to fetch premium user vehicles' })

        return res.status(200).json(premium_vehicles)
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

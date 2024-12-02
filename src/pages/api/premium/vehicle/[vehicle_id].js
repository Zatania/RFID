import db from '../../db'

const deleteVehicle = async vehicle_id => {
  try {
    const [vehicle] = await db.query('SELECT premium_id FROM vehicles WHERE id = ?', [vehicle_id])

    if (vehicle.length === 0) {
      throw new Error('Vehicle not found')
    }

    const premium_id = vehicle[0].premium_id

    await db.query('DELETE FROM vehicles WHERE id = ?', [vehicle_id])

    const [countResult] = await db.query('SELECT COUNT(*) as count FROM vehicles WHERE premium_id = ?', [premium_id])

    if (countResult[0].count <= 1) {
      await db.query('UPDATE premiums SET status = ? WHERE id = ?', ['Inactive', premium_id])
    }

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { vehicle_id } = req.query
      try {
        const vehicle = await deleteVehicle(vehicle_id)

        if (!vehicle) return res.status(400).json({ message: 'Failed to delete vehicle' })

        return res.status(200).json({ message: 'Vehicle deleted successfully' })
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

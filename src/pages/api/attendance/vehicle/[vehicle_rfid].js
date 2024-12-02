import db from '../../db'

const getVehicleData = async vehicle_rfid => {
  const [vehicle] = await db.query(
    `
    SELECT vehicles.*, rfids.value as rfid
    FROM vehicles
    LEFT JOIN rfids ON vehicles.id = rfids.vehicle_id
    WHERE rfids.value = ?
  `,
    [vehicle_rfid]
  )

  return vehicle[0]
}

const handler = async (req, res) => {
  const { vehicle_rfid } = req.query
  if (req.method === 'GET') {
    try {
      const vehicle = await getVehicleData(vehicle_rfid)
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle Not Found' })
      }

      return res.status(200).json(vehicle)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

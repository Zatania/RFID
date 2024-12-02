import db from '../../db'
import dayjs from 'dayjs'

const fetchParkedVehicles = async () => {
  try {
    const query = `
      SELECT
        ph.id AS history_id,
        ph.timestamp_in AS time_in,
        vehicles.plate_number AS plate_number,
        TIMESTAMPDIFF(SECOND, timestamp_in, NOW()) AS elapsed_time_seconds
      FROM user_parking_history ph
      JOIN users ON ph.user_id = users.id
      JOIN vehicles ON users.id = vehicles.user_id
      WHERE ph.timestamp_out IS NULL

      UNION ALL

      SELECT
        ph.id AS history_id,
        ph.timestamp_in AS time_in,
        vehicles.plate_number AS plate_number,
        TIMESTAMPDIFF(SECOND, timestamp_in, NOW()) AS elapsed_time_seconds
      FROM premium_parking_history ph
      JOIN premiums ON ph.premium_id = premiums.id
      JOIN vehicles ON premiums.id = vehicles.premium_id
      WHERE ph.timestamp_out IS NULL

      UNION all

      SELECT
        ph.id AS history_id,
        ph.timestamp_in AS time_in,
        visitors.vehicle_plate_number AS plate_number,
        TIMESTAMPDIFF(SECOND, timestamp_in, NOW()) AS elapsed_time_seconds
      FROM visitor_parking_history ph
      JOIN visitors ON ph.visitor_id = visitors.id
      WHERE ph.timestamp_out IS null

      ORDER BY time_in DESC;
    `

    const [vehicles] = await db.query(query)

    const formattedRows = vehicles.map(vehicle => {
      const elapsedSeconds = vehicle.elapsed_time_seconds
      const hours = Math.floor(elapsedSeconds / 3600) // Convert seconds to hours
      const minutes = Math.floor((elapsedSeconds % 3600) / 60) // Get remaining minutes
      const formattedDuration = `${hours}h ${minutes}m`

      return {
        ...vehicle,
        time_in: dayjs(vehicle.time_in).format('hh:mm A'),
        elapsed_time: formattedDuration
      }
    })

    return formattedRows
  } catch (error) {
    console.error('Error fetching parked vehicles:', error)

    return []
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const logs = await fetchParkedVehicles()

      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

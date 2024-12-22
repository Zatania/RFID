import db from '../../db'
import dayjs from 'dayjs'

const fetchParkedVehicles = async () => {
  try {
    const query = `
      SELECT
        ph.id AS history_id,
        'user_parking_history' AS table_name,
        CONCAT(users.first_name, ' ', users.last_name) AS full_name,
        vehicles.plate_number AS plate_number,
        ph.timestamp_in AS time_in,
        TIMESTAMPDIFF(SECOND, ph.timestamp_in, NOW()) AS elapsed_time_seconds,
        ph.status AS status
      FROM user_parking_history ph
      JOIN vehicles ON ph.vehicle_id = vehicles.id
      JOIN users ON ph.user_id = users.id
      WHERE ph.timestamp_out IS NULL

      UNION ALL

      SELECT
        ph.id AS history_id,
        'premium_parking_history' AS table_name,
        CONCAT(premiums.first_name, ' ', premiums.last_name) AS full_name,
        vehicles.plate_number AS plate_number,
        ph.timestamp_in AS time_in,
        TIMESTAMPDIFF(SECOND, ph.timestamp_in, NOW()) AS elapsed_time_seconds,
        ph.status AS status
      FROM premium_parking_history ph
      JOIN vehicles ON ph.vehicle_id = vehicles.id
      JOIN premiums ON ph.premium_id = premiums.id
      WHERE ph.timestamp_out IS NULL

      UNION ALL

      SELECT
        ph.id AS history_id,
        'visitor_parking_history' AS table_name,
        CONCAT(visitors.first_name, ' ', visitors.last_name) AS full_name,
        visitors.vehicle_plate_number AS plate_number,
        ph.timestamp_in AS time_in,
        TIMESTAMPDIFF(SECOND, ph.timestamp_in, NOW()) AS elapsed_time_seconds,
        ph.status AS status
      FROM visitor_parking_history ph
      JOIN visitors ON ph.visitor_id = visitors.id
      WHERE ph.timestamp_out IS NULL

      ORDER BY time_in DESC;
    `

    // Execute the query
    const [vehicles] = await db.query(query)

    // Loop through results to format rows and check for elapsed time > 8 hours
    for (const vehicle of vehicles) {
      const elapsedSeconds = vehicle.elapsed_time_seconds
      const hours = Math.floor(elapsedSeconds / 3600) // Convert seconds to hours
      const minutes = Math.floor((elapsedSeconds % 3600) / 60) // Get remaining minutes
      const formattedDuration = `${hours}h ${minutes}m`

      vehicle.elapsed_time = formattedDuration // Add formatted duration
      vehicle.time_in = dayjs(vehicle.time_in).format('hh:mm A')

      // If elapsed time exceeds 8 hours, update the status only for user and visitor parking histories
      if (
        hours >= 8 &&
        (vehicle.table_name === 'user_parking_history' || vehicle.table_name === 'visitor_parking_history')
      ) {
        const updateQuery = `
          UPDATE ${vehicle.table_name}
          SET status = 'Overparked'
          WHERE id = ? AND timestamp_out IS NULL
        `

        // Execute the update query
        await db.query(updateQuery, [vehicle.history_id])
      } else if (
        hours < 8 &&
        (vehicle.table_name === 'user_parking_history' ||
          vehicle.table_name === 'premium_parking_history' ||
          vehicle.table_name === 'visitor_parking_history')
      ) {
        const updateQuery = `
          UPDATE ${vehicle.table_name}
          SET status = 'Parked'
          WHERE id = ? AND timestamp_out IS NULL
        `

        // Execute the update query
        await db.query(updateQuery, [vehicle.history_id])
      }
    }

    return vehicles
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

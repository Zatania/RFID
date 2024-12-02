import db from '../db'
import dayjs from 'dayjs'

const fetchViolations = async () => {
  try {
    const [rows] = await db.query(`
      SELECT
        violations.*,
        -- User information (full name, parking history)
        CONCAT(
          COALESCE(users.first_name, premiums.first_name),
          ' ',
          COALESCE(users.middle_name, premiums.middle_name, ''),
          ' ',
          COALESCE(users.last_name, premiums.last_name)
        ) AS full_name,

        -- Using OR to pick from either user_parking_history or premium_parking_history
        COALESCE(user_parking_history.timestamp_in, premium_parking_history.timestamp_in) AS time_in,
        COALESCE(user_parking_history.timestamp_out, premium_parking_history.timestamp_out) AS time_out,
        COALESCE(user_parking_history.duration, premium_parking_history.duration) AS duration,

        -- Picking the correct history table (user or premium parking history)
        COALESCE(user_parking_history.timestamp_in, premium_parking_history.timestamp_in) AS time_in,
        COALESCE(user_parking_history.timestamp_out, premium_parking_history.timestamp_out) AS time_out,
        COALESCE(user_parking_history.duration, premium_parking_history.duration) AS duration

      FROM violations
      LEFT JOIN users ON violations.user_id = users.id
      LEFT JOIN user_parking_history ON violations.user_history_id = user_parking_history.id
      LEFT JOIN premiums ON violations.premium_id = premiums.id
      LEFT JOIN premium_parking_history ON violations.premium_history_id = premium_parking_history.id
      ORDER BY violations.created_at DESC
    `)

    const formattedRows = rows.map(row => {
      const elapsedSeconds = row.duration
      const hours = Math.floor(elapsedSeconds / 3600) // Convert seconds to hours
      const minutes = Math.floor((elapsedSeconds % 3600) / 60) // Get remaining minutes
      const formattedDuration = `${hours}h ${minutes}m`

      return {
        ...row,
        full_name: row.full_name, // Combining user/premium name
        timestamp: dayjs(row.timestamp).format('MMMM D, YYYY hh:mm:ss A'),
        time_in: dayjs(row.time_in).format('MMMM D, YYYY hh:mm:ss A'),
        time_out: dayjs(row.time_out).format('MMMM D, YYYY hh:mm:ss A'),
        duration: formattedDuration
      }
    })

    return formattedRows
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const violations = await fetchViolations()

      res.status(200).json(violations)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

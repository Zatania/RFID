import db from '../../db'
import dayjs from 'dayjs'

const fetchViolations = async () => {
  try {
    const [rows] = await db.query(`
      SELECT
        violations.*,
        CONCAT(users.first_name, ' ', COALESCE(users.middle_name, ''), ' ', users.last_name) AS user_full_name,
        logs.timestamp_in AS time_in,
        logs.timestamp_out AS time_out,
        logs.duration AS duration
      FROM violations
      LEFT JOIN users ON violations.user_id = users.user_id
      LEFT JOIN logs ON violations.log_id = logs.log_id
      ORDER BY violations.created_at DESC
    `)

    const formattedRows = rows.map(row => {
      const durationInMinutes = row.duration
      const hours = Math.floor(durationInMinutes / 60)
      const minutes = durationInMinutes % 60
      const formattedDuration = `${hours}h ${minutes}m`

      return {
        ...row,
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

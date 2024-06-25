import db from '../../../db'
import dayjs from 'dayjs'

const fetchLogs = async () => {
  try {
    const [rows] = await db.query(`
      SELECT
        daily_logs.*,
        CONCAT(users.first_name, ' ',  users.last_name) AS user_full_name,
        CONCAT(security_guards.first_name, ' ', COALESCE(CONCAT(security_guards.middle_name, ' '), ''), security_guards.last_name) AS guard_full_name
      FROM daily_logs
      LEFT JOIN users ON daily_logs.daily_user_id = users.user_id
      LEFT JOIN security_guards ON daily_logs.daily_guard_id = security_guards.guard_id
      WHERE DATE(daily_logs.daily_timestamp) = CURDATE()
      ORDER BY daily_logs.daily_timestamp DESC
    `)

    const formattedRows = rows.map(row => {
      return {
        ...row,
        daily_timestamp: row.daily_timestamp ? dayjs(row.daily_timestamp).format('MMMM D, YYYY hh:mm:ss A') : ''
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
      const logs = await fetchLogs()

      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

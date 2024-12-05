import db from '../db'
import dayjs from 'dayjs'

const fetchUserLogs = async userType => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        user_parking_history.*,
        CONCAT(users.first_name, ' ',  users.last_name) AS user_full_name,
        CONCAT(security_guards.first_name, ' ', COALESCE(CONCAT(security_guards.middle_name, ' '), ''), security_guards.last_name) AS guard_full_name
      FROM user_parking_history
      LEFT JOIN users ON user_parking_history.user_id = users.id
      LEFT JOIN security_guards ON user_parking_history.guard_id = security_guards.id
      WHERE users.type = ?
      ORDER BY user_parking_history.timestamp_in DESC
    `,
      [userType]
    )

    const formattedRows = rows.map(row => {
      const durationInMinutes = row.duration
      const hours = Math.floor(durationInMinutes / 60)
      const minutes = durationInMinutes % 60
      const formattedDuration = `${hours}h ${minutes}m`

      return {
        ...row,
        timestamp_in: row.timestamp_in ? dayjs(row.timestamp_in).format('MMMM D, YYYY hh:mm:ss A') : '',
        timestamp_out: row.timestamp_out ? dayjs(row.timestamp_out).format('MMMM D, YYYY hh:mm:ss A') : '',
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
    const { userType } = req.query
    console.log('userType:', userType)

    try {
      const logs = await fetchUserLogs(userType)

      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

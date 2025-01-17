import db from '../db'
import dayjs from 'dayjs'

const fetchUserLogs = async userType => {
  try {
    if (userType === 'Student' || userType === 'Employee') {
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
        const elapsedSeconds = row.duration
        const hours = Math.floor(elapsedSeconds / 3600) // Convert seconds to hours
        const minutes = Math.floor((elapsedSeconds % 3600) / 60) // Get remaining minutes
        const formattedDuration = `${hours}h ${minutes}m`

        return {
          ...row,
          timestamp_in: row.timestamp_in ? dayjs(row.timestamp_in).format('MMMM D, YYYY hh:mm A') : '',
          timestamp_out: row.timestamp_out ? dayjs(row.timestamp_out).format('MMMM D, YYYY hh:mm A') : '',
          duration: formattedDuration
        }
      })

      return formattedRows
    } else if (userType === 'Premium') {
      const [rows] = await db.query(`
        SELECT
          premium_parking_history.*,
          CONCAT(premiums.first_name, ' ',  COALESCE(CONCAT(premiums.middle_name, ' '), ''), premiums.last_name) AS user_full_name,
          CONCAT(security_guards.first_name, ' ', COALESCE(CONCAT(security_guards.middle_name, ' '), ''), security_guards.last_name) AS guard_full_name
        FROM premium_parking_history
        LEFT JOIN premiums ON premium_parking_history.premium_id = premiums.id
        LEFT JOIN security_guards ON premium_parking_history.guard_id = security_guards.id
        ORDER BY premium_parking_history.timestamp_in DESC
      `)

      const formattedRows = rows.map(row => {
        const durationInMinutes = row.duration
        const hours = Math.floor(durationInMinutes / 60)
        const minutes = durationInMinutes % 60
        const formattedDuration = `${hours}h ${minutes}m`

        return {
          ...row,
          timestamp_in: row.timestamp_in ? dayjs(row.timestamp_in).format('MMMM D, YYYY hh:mm A') : '',
          timestamp_out: row.timestamp_out ? dayjs(row.timestamp_out).format('MMMM D, YYYY hh:mm A') : '',
          duration: formattedDuration
        }
      })

      return formattedRows
    } else if (userType === 'Visitor') {
      const [rows] = await db.query(`
        SELECT
          visitor_parking_history.*,
          CONCAT(visitors.first_name, ' ',  COALESCE(CONCAT(visitors.middle_name, ' '), ''), visitors.last_name) AS user_full_name,
          CONCAT(security_guards.first_name, ' ', COALESCE(CONCAT(security_guards.middle_name, ' '), ''), security_guards.last_name) AS guard_full_name
        FROM visitor_parking_history
        LEFT JOIN visitors ON visitor_parking_history.visitor_id = visitors.id
        LEFT JOIN security_guards ON visitor_parking_history.guard_id = security_guards.id
        ORDER BY visitor_parking_history.timestamp_in DESC
      `)

      const formattedRows = rows.map(row => {
        const durationInMinutes = row.duration
        const hours = Math.floor(durationInMinutes / 60)
        const minutes = durationInMinutes % 60
        const formattedDuration = `${hours}h ${minutes}m`

        return {
          ...row,
          timestamp_in: row.timestamp_in ? dayjs(row.timestamp_in).format('MMMM D, YYYY hh:mm A') : '',
          timestamp_out: row.timestamp_out ? dayjs(row.timestamp_out).format('MMMM D, YYYY hh:mm A') : '',
          duration: formattedDuration
        }
      })

      return formattedRows
    }
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { userType } = req.query

    try {
      const logs = await fetchUserLogs(userType)

      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

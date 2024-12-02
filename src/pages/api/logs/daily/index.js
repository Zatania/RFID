import db from '../../db'
import dayjs from 'dayjs'

const fetchLogs = async () => {
  try {
    const [rows] = await db.query(`
      -- UNION to combine results from different parking log types
      SELECT
          pl.id AS log_id,
          ph.id AS history_id,
          CONCAT(a.first_name, ' ',  a.last_name) as account_name,
          pl.action,
          pl.created_at
      FROM user_parking_logs pl
      JOIN user_parking_history ph ON pl.history_id = ph.id
      JOIN users a ON ph.user_id = a.id

      UNION ALL

      SELECT
          pl.id AS log_id,
          ph.id AS history_id,
          CONCAT(a.first_name, ' ',  a.last_name) AS account_name,
          pl.action,
          pl.created_at
      FROM premium_parking_logs pl
      JOIN premium_parking_history ph ON pl.history_id = ph.id
      JOIN premiums a ON ph.premium_id = a.id

      UNION ALL

      SELECT
          pl.id AS log_id,
          ph.id AS history_id,
          CONCAT(a.first_name, ' ',  a.last_name) AS account_name,
          pl.action,
          pl.created_at
      FROM visitor_parking_logs pl
      JOIN visitor_parking_history ph ON pl.history_id = ph.id
      JOIN visitors a ON ph.visitor_id = a.id
      WHERE DATE(pl.created_at) = CURDATE()
      ORDER BY created_at DESC;
    `)

    const formattedRows = rows.map(row => {
      return {
        ...row,
        created_at: row.created_at ? dayjs(row.created_at).format('MM/DD/YY hh:mm A') : ''
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

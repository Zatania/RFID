import db from '../../../db'
import dayjs from 'dayjs'

const fetchTopUpHistory = async () => {
  try {
    const [rows] = await db.query(`
      SELECT
        topup_history.*,
        -- User information (full name)
        CONCAT(
          COALESCE(users.first_name, premiums.first_name),
          ' ',
          COALESCE(users.last_name, premiums.last_name)
        ) AS full_name,
        -- BAO Information (full name)
        CONCAT(
          COALESCE(baos.first_name, ''),
          ' ',
          COALESCE(baos.last_name, '')
        ) AS bao
      FROM topup_history
      LEFT JOIN users ON topup_history.user_id = users.id
      LEFT JOIN premiums ON topup_history.premium_id = premiums.id
      LEFT JOIN baos ON topup_history.bao_id = baos.id
      ORDER BY topup_history.created_by DESC
    `)

    const formattedRows = rows.map(row => {
      return {
        ...row,
        full_name: row.full_name, // Combining user/premium name
        bao: row.bao, // Combining BAO name
        created_by: dayjs(row.created_by).format('MMMM D, YYYY hh:mm:ss A')
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
      const topuphistory = await fetchTopUpHistory()

      res.status(200).json(topuphistory)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

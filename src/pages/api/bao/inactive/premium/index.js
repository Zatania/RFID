import db from '../../../db'
import dayjs from 'dayjs'

const fetchInactives = async () => {
  try {
    const [results] = await db.query(`
        SELECT
            premiums.id,
            premiums.first_name,
            premiums.middle_name,
            premiums.last_name,
            premiums.duration,
            premiums.start_date,
            premiums.end_date,
            premiums.status,
            rfids.load_balance,
            'Premium' AS account_type
        FROM
            premiums
        LEFT JOIN rfids ON rfids.premium_id = premiums.id
        WHERE premiums.status = 'Inactive';
      `)

    return results.map(result => {
      if (result.start_date) {
        result.start_date = dayjs(result.start_date).format('MM/DD/YYYY')
      } else {
        result.start_date = 'N/A'
      }

      if (result.end_date) {
        result.end_date = dayjs(result.end_date).format('MM/DD/YYYY')
      } else {
        result.end_date = 'N/A'
      }

      if (result.duration === 1) {
        result.duration = '1 Month'
      } else if (!result.duration || result.duration === 'NULL') {
        result.duration = 'N/A'
      } else {
        result.duration = `${result.duration} Months`
      }

      return result
    })
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const inactiveCount = await fetchInactives()

      res.status(200).json(inactiveCount)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

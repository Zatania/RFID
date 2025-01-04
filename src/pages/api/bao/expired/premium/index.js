import db from '../../../db'
import dayjs from 'dayjs'

const fetchActives = async () => {
  try {
    const [results] = await db.query(`
        SELECT
            premiums.id AS id,
            premiums.image AS image,
            premiums.first_name AS first_name,
            premiums.middle_name AS middle_name,
            premiums.last_name AS last_name,
            premiums.duration AS duration,
            premiums.start_date AS start_date,
            premiums.end_date AS end_date,
            premiums.status AS status,
            rfids.load_balance AS load_balance,
            CASE
              WHEN premiums.id IS NOT NULL THEN 'Premium'
              ELSE 'Unknown'
            END AS account_type
        FROM
            RFIDs rfids
        LEFT JOIN Premiums premiums ON rfids.premium_id = premiums.id
        WHERE premiums.status = 'Expired';
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

const renewAccount = async ({ id, duration, account_type }) => {
  const currentDate = new Date()
  const currentDateFormatted = dayjs(currentDate).format('YYYY-MM-DD')

  if (!duration) {
    throw new Error('Duration is required')
  }

  let accountQuery

  switch (account_type) {
    case 'Premium':
      accountQuery = 'UPDATE premiums SET status = "Active", duration = ?, start_date = ? WHERE id = ?'
      break
    default:
      throw new Error('Invalid account type')
  }

  const [accountResult] = await db.query(accountQuery, [duration, currentDateFormatted, id])

  if (!accountResult.affectedRows) {
    throw new Error('Account not found or already active')
  }

  return true
}

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      try {
        const activeCount = await fetchActives()

        res.status(200).json(activeCount)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      try {
        const accountActivated = await renewAccount(formData)

        if (!accountActivated) return res.status(400).json({ message: 'Failed to activate account' })

        return res.status(200).json({ message: 'Account activated successfully' })
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

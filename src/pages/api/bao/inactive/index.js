import db from '../../db'

const fetchInactives = async () => {
  try {
    const [result] = await db.query(`
        SELECT
            users.id,
            users.first_name,
            users.middle_name,
            users.last_name,
            users.status,
            rfids.load_balance,
            'User' AS account_type
        FROM
            users
        LEFT JOIN RFIDs rfids ON rfids.user_id = users.id
        WHERE
            users.status = 'Inactive'
        UNION ALL
        SELECT
            premiums.id,
            premiums.first_name,
            premiums.middle_name,
            premiums.last_name,
            premiums.status,
            rfids.load_balance,
            'Premium' AS account_type
        FROM
            premiums
        LEFT JOIN RFIDs rfids ON rfids.premium_id = premiums.id
        WHERE premiums.status = 'Inactive';
      `)

    return result
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

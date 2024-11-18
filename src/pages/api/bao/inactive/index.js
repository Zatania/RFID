import db from '../../db'

const fetchInactives = async () => {
  try {
    const [result] = await db.query(`
        SELECT
            COALESCE(users.id, premiums.id) AS id,
            COALESCE(users.first_name, premiums.first_name) AS first_name,
            COALESCE(users.middle_name, premiums.middle_name) AS middle_name,
            COALESCE(users.last_name, premiums.last_name) AS last_name,
            COALESCE(users.status, premiums.status) AS status,
            rfids.load_balance AS load_balance,
            CASE
              WHEN users.id IS NOT NULL THEN 'User'
              WHEN premiums.id IS NOT NULL THEN 'Premium'
              ELSE 'Unknown'
            END AS account_type
        FROM
            RFIDs rfids
        LEFT JOIN Users users ON rfids.user_id = users.id
        LEFT JOIN Premiums premiums ON rfids.premium_id = premiums.id
        WHERE COALESCE(users.status, premiums.status) = 'Inactive';
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

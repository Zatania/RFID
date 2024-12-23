import db from '../../db'

const fetchActives = async () => {
  try {
    const [result] = await db.query(`
        SELECT
            COALESCE(users.id, premiums.id) AS id,
            COALESCE(users.image, premiums.image) AS image,
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
        WHERE COALESCE(users.status, premiums.status) = 'Active';
      `)

    return result
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const activateAccount = async ({ id, load_balance, account_type }) => {
  if (typeof load_balance === 'string') load_balance = parseFloat(load_balance)

  if (load_balance <= 0) {
    throw new Error('Load balance must be greater than 0')
  }

  let accountQuery
  let rfidQuery

  switch (account_type) {
    case 'User':
      accountQuery = 'UPDATE users SET status = "Active" WHERE id = ?'
      break
    case 'Premium':
      accountQuery = 'UPDATE premiums SET status = "Active" WHERE id = ?'
      break
    default:
      throw new Error('Invalid account type')
  }

  rfidQuery = 'UPDATE rfids SET load_balance = ? WHERE user_id = ? OR premium_id = ?'

  const [accountResult] = await db.query(accountQuery, [id])

  const [rfidResult] = await db.query(rfidQuery, [load_balance, id, id])

  if (!accountResult.affectedRows) {
    throw new Error('Account not found or already active')
  }

  if (!rfidResult.affectedRows) {
    throw new Error('RFID record not updated')
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
        const accountActivated = await activateAccount(formData)

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

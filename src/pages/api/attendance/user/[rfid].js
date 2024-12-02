import db from '../../db'

const getAccountData = async rfid => {
  // Query for the users table
  const [userAccount] = await db.query(
    `
    SELECT
      users.*,
      'User' AS type,
      rfids.load_balance AS balance
    FROM users
    LEFT JOIN rfids ON users.id = rfids.user_id
    WHERE rfids.value = ?
    `,
    [rfid]
  )

  if (userAccount && userAccount.length > 0) {
    return userAccount[0] // Return user account if found
  }

  // Query for the premiums table
  const [premiumAccount] = await db.query(
    `
    SELECT
      premiums.*,
      'Premium' AS type,
      rfids.load_balance AS balance
    FROM premiums
    LEFT JOIN rfids ON premiums.id = rfids.premium_id
    WHERE rfids.value = ?
    `,
    [rfid]
  )

  if (premiumAccount && premiumAccount.length > 0) {
    return premiumAccount[0] // Return premium account if found
  }

  // Query for the visitors table
  const [visitorAccount] = await db.query(
    `
    SELECT
      visitors.*,
      'Visitor' AS type,
      rfids.load_balance AS balance
    FROM visitors
    LEFT JOIN rfids ON visitors.id = rfids.visitor_id
    WHERE rfids.value = ?
    `,
    [rfid]
  )

  if (visitorAccount && visitorAccount.length > 0) {
    return visitorAccount[0] // Return visitor account if found
  }

  return null // Return null if no account found in any table
}

const handler = async (req, res) => {
  const { rfid } = req.query
  if (req.method === 'GET') {
    try {
      const account = await getAccountData(rfid)

      if (!account) {
        return res.status(404).json({ message: 'Account Not Found' })
      }

      return res.status(200).json(account)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

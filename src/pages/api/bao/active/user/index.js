import db from '../../../db'

const fetchActives = async () => {
  try {
    const [result] = await db.query(`
        SELECT
            users.id AS id,
            users.image AS image,
            users.first_name AS first_name,
            users.middle_name AS middle_name,
            users.last_name AS last_name,
            users.status AS status,
            rfids.load_balance AS load_balance,
            CASE
              WHEN users.id IS NOT NULL THEN 'User'
              ELSE 'Unknown'
            END AS account_type
        FROM
            rfids
        LEFT JOIN users ON rfids.user_id = users.id
        WHERE users.status = 'Active';
      `)

    return result
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const activateAccount = async ({ id, bao_id, load_balance, account_type }) => {
  if (typeof load_balance === 'string') load_balance = parseFloat(load_balance)

  if (load_balance <= 0) {
    throw new Error('Load balance must be greater than 0')
  }

  // Check if the user's RFID exists
  const [userRfidCheck] = await db.query(`SELECT COUNT(*) AS count FROM rfids WHERE user_id = ?`, [id])

  if (userRfidCheck[0].count === 0) {
    throw new Error('User RFID does not exist')
  }

  // Check if the user has a vehicle
  const [vehicleCheck] = await db.query(
    `SELECT vehicles.id AS vehicle_id
     FROM vehicles
     WHERE vehicles.user_id = ?`,
    [id]
  )

  if (vehicleCheck.length === 0) {
    throw new Error('User does not have a vehicle added')
  }

  const vehicleId = vehicleCheck[0].vehicle_id

  // Check if the vehicle's RFID exists
  const [vehicleRfidCheck] = await db.query(`SELECT COUNT(*) AS count FROM rfids WHERE vehicle_id = ?`, [vehicleId])

  if (vehicleRfidCheck[0].count === 0) {
    throw new Error("User's vehicle RFID does not exist")
  }

  let accountQuery, rfidQuery, historyQuery

  switch (account_type) {
    case 'User':
      accountQuery = 'UPDATE users SET status = "Active" WHERE id = ?'
      historyQuery = 'INSERT INTO topup_history (user_id, bao_id, load_amount) VALUES (?, ?, ?)'
      break
    default:
      throw new Error('Invalid account type')
  }

  rfidQuery = 'UPDATE rfids SET load_balance = ? WHERE user_id = ?'

  const [accountResult] = await db.query(accountQuery, [id])

  const [rfidResult] = await db.query(rfidQuery, [load_balance, id])

  const [historyResult] = await db.query(historyQuery, [id, bao_id, load_balance])

  if (!accountResult.affectedRows) {
    throw new Error('Account not found or already active')
  }

  if (!rfidResult.affectedRows) {
    throw new Error('RFID record not updated')
  }

  if (!historyResult.affectedRows) {
    throw new Error('Topup history not updated')
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

import db from '../db'

const postParking = async (guard_id, account_id, account_type) => {
  try {
    const currentTime = new Date()
    const hours = currentTime.getHours()
    let message

    // Mapping account types to their respective tables
    const tableMap = {
      User: { history: 'user_parking_history', log: 'User_Parking_Logs' },
      Premium: { history: 'premium_parking_history', log: 'Premium_Parking_Logs' },
      Visitor: { history: 'visitor_parking_history', log: 'Visitor_Parking_Logs' }
    }

    const { history, log } = tableMap[account_type]

    // Query to check if the user is already checked in
    const [existingLog] = await db.query(
      `SELECT * FROM ${history} WHERE ${account_type.toLowerCase()}_id = ? AND timestamp_out IS NULL`,
      [account_id]
    )

    if (existingLog.length) {
      // User is checking out, update the parking history with timestamp_out
      const historyId = existingLog[0].id
      await db.query(`UPDATE ${historyTable} SET timestamp_out = ? WHERE id = ?`, [currentTime, historyId])

      // Check if time-out is past 5 PM
      if (hours >= 17) {
        const notes = 'Time out way past 5pm.'

        // Add a violation for late time out
        await db.query(`INSERT INTO violations (user_id, notes, status) VALUES (?, ?, 'Unresolved')`, [
          account_id,
          notes
        ])

        // Log for TIME OUT with late violation
        await db.query(`INSERT INTO ${logTable} (history_id, action) VALUES (?, ?)`, [historyId, 'LATE TIME OUT'])
        message = `${account_type} checked out after 5pm. Violation added for late time out.`
      } else {
        // Log for regular TIME OUT
        await db.query(`INSERT INTO ${logTable} (history_id, action) VALUES (?, ?)`, [historyId, 'TIME OUT'])
        message = `${account_type} checked out successfully.`
      }
    } else {
      // User is checking in, insert a new record into the parking history
      const [insertResult] = await db.query(
        `INSERT INTO ${historyTable} (${account_type.toLowerCase()}_id, guard_id, timestamp_in) VALUES (?, ?, ?)`,
        [account_id, guard_id, currentTime]
      )

      const historyId = insertResult.insertId

      // Insert action log for TIME IN
      await db.query(`INSERT INTO ${logTable} (history_id, action) VALUES (?, ?)`, [historyId, 'TIME IN'])

      message = `${account_type} checked in successfully.`
    }

    return message
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  const { account_id } = req.query
  const { guard_id, account_type } = req.body

  console.log(req.body)
  try {
    if (req.method === 'POST') {
      try {
        // Check for violations only if it's not a visitor
        if (account.type !== 'Visitor') {
          const violationCount = await getViolationCount(account_id)
          if (violationCount >= 3) {
            return res.status(200).json({
              message: `${account.type} has too many violations and is not allowed to time in.`
            })
          }
        }

        const message = await postParking(guard_id, account_id, account_type)
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    if (error) {
      return res.status(500).json({ message: error.message })
    } else {
      return res.status(500).json({ message: 'Something went wrong' })
    }
  }
}

export default handler

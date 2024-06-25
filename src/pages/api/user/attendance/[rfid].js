import db from '../../db'

const getUserData = async rfid => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE rfid = ?', [rfid])

    return result[0]
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const getViolationCount = async user_id => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) AS violation_count FROM violations WHERE user_id = ? AND status = ?',
      [user_id, 'Unresolved']
    )

    return result[0].violation_count
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const updateAttendance = async (user_id, guard_id) => {
  try {
    const [existingLog] = await db.query('SELECT * FROM logs WHERE user_id = ? AND timestamp_out IS NULL', [user_id])
    let log = existingLog[0]
    const currentTime = new Date()
    let message
    if (log) {
      const hours = currentTime.getHours()

      if (hours >= 17) {
        const notes = 'Time out way past 5pm.'
        await db.query('UPDATE logs SET timestamp_out = ? WHERE log_id = ?', [currentTime, log.log_id])
        await db.query('INSERT INTO daily_logs (daily_user_id, daily_guard_id, daily_status) VALUES (?, ?, ?)', [
          user_id,
          guard_id,
          'LATE TIME OUT'
        ])
        await addViolation(user_id, notes, log.log_id)
        message = 'Time out recorded. Violation added for late time out.'
      } else {
        await db.query('UPDATE logs SET timestamp_out = ? WHERE log_id = ?', [currentTime, log.log_id])
        await db.query('INSERT INTO daily_logs (daily_user_id, daily_guard_id, daily_status) VALUES (?, ?, ?)', [
          user_id,
          guard_id,
          'TIME OUT'
        ])
        message = 'Time out recorded.'
      }
    } else {
      await db.query('INSERT INTO logs (user_id, guard_id) VALUES (?, ?)', [user_id, guard_id])
      await db.query('INSERT INTO daily_logs (daily_user_id, daily_guard_id, daily_status) VALUES (?, ?, ?)', [
        user_id,
        guard_id,
        'TIME IN'
      ])
      message = 'Time in recorded.'
    }

    return message
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const addViolation = async (user_id, notes, log_id) => {
  try {
    await db.query('INSERT INTO violations (user_id, log_id, notes, status) VALUES (?, ?, ?, ?)', [
      user_id,
      log_id,
      notes,
      'Unresolved'
    ])
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  const { rfid } = req.query
  if (req.method === 'POST') {
    try {
      const { guard_id } = req.body

      const user = await getUserData(rfid)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const violationCount = await getViolationCount(user.user_id)
      if (violationCount >= 3) {
        return res.status(200).json({
          user,
          message: 'User has too many violations and is not allowed to time in.'
        })
      }

      const message = await updateAttendance(user.user_id, guard_id)

      return res.status(200).json({ user, message })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

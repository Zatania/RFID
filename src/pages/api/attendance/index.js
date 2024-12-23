import db from '../db'

const parkingAttendance = async (account, guard_id, vehicle_id, rfid, vehicleRfid) => {
  const currentTime = new Date()
  const hours = currentTime.getHours()
  let message

  // Check if the account is a visitor or user
  if (account.type === 'Visitor') {
    // For visitors, log into the visitor parking history
    const [existingEntry] = await db.query(
      'SELECT * FROM visitor_parking_history WHERE visitor_id = ? AND timestamp_out IS NULL ORDER BY timestamp_in DESC LIMIT 1',
      [account.id]
    )

    if (existingEntry.length > 0) {
      const historyId = existingEntry[0].id

      // If there's an existing entry with no time_out, update the time_out
      await db.query('UPDATE visitor_parking_history SET timestamp_out = NOW() WHERE id = ?', [historyId])
      await db.query('INSERT INTO visitor_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'TIME OUT'])

      message = 'Visitor Checked out successfully'

      return message
    } else {
      // If there's no existing entry, create a new one
      const [updateEntry] = await db.query(
        'INSERT INTO visitor_parking_history (visitor_id, guard_id, timestamp_in) VALUES (?, ?, NOW())',
        [account.id, guard_id]
      )
      const historyId = updateEntry.insertId
      await db.query('INSERT INTO visitor_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'TIME IN'])

      message = 'Visitor Checked in successfully'

      return message
    }
  } else if (account.type === 'User') {
    const userId = account.id
    const phone_number = account.phone_number

    // Check if the vehicle belongs to the user
    const vehicleBelongsToUser = await checkIfVehicleBelongsToUser(vehicleRfid, userId)

    if (!vehicleBelongsToUser) {
      throw new Error('Vehicle does not belong to the user')
    }

    // Check if there is an existing entry for the user
    const [existingEntry] = await db.query(
      'SELECT * FROM user_parking_history WHERE user_id = ? AND timestamp_out IS NULL ORDER BY timestamp_in DESC LIMIT 1',
      [account.id]
    )

    if (existingEntry.length > 0) {
      const historyId = existingEntry[0].id

      if (hours >= 17) {
        // Add a violation for late time out
        const violationNotes = 'Time out way past 5pm.'
        await db.query('INSERT INTO violations (user_id, user_history_id, notes, status) VALUES (?, ?, ?, ?)', [
          userId,
          historyId,
          violationNotes,
          'Unresolved'
        ])

        // Add to notifications about violation
        const notifTitle = 'Late Time Out'

        const notifMessage =
          'You checked out way past 5pm. A violation has been added to your account. Thank you for parking with us.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        // Log for TIME OUT with late violation
        await db.query('UPDATE user_parking_history SET timestamp_out = NOW() WHERE id = ?', [historyId])
        await db.query('INSERT INTO user_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'LATE TIME OUT'])
        message = 'User checked out after 5pm. Violation added for late time out. Thank you for parking with us.'

        return message
      } else {
        // If there's an existing entry with no time_out, update the time_out
        await db.query('UPDATE user_parking_history SET timestamp_out = NOW() WHERE id = ?', [historyId])
        await db.query('INSERT INTO user_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'TIME OUT'])
        message = 'User checked out successfully. Thank you for parking with us.'

        // Add to notifications about successful check out
        const notifTitle = 'Time Out'
        const notifMessage = 'You checked out successfully. Thank you for parking with us.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        return message
      }
    } else {
      // Deduct the parking fee from the user's RFID
      const balance = await deductBalance(rfid)

      // check if balance is insufficient
      if (!balance) {
        // Add to notifications about insufficient balance
        const notifTitle = 'Insufficient Balance'
        const notifMessage = 'You have insufficient balance to pay for parking. Please reload your account.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )
        message = 'Insufficient balance. Please reload your account.'

        return message
      } else {
        let notifTitle, notifMessage

        // Add to notifications about deduction
        notifTitle = 'Deduction'
        notifMessage = `You have been charged for parking. Your new balance is Php${balance}.`
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        // If there's no existing entry, create a new one
        const [updateEntry] = await db.query(
          'INSERT INTO user_parking_history (user_id, guard_id, vehicle_id, timestamp_in) VALUES (?, ?, ?, NOW())',
          [account.id, guard_id, vehicle_id]
        )
        const historyId = updateEntry.insertId
        await db.query('INSERT INTO user_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'TIME IN'])
        message = 'User checked in successfully. Thank you for parking with us.'

        // Add to notifications about successful check in
        notifTitle = 'Time In'
        notifMessage = 'You checked in successfully. Thank you for parking with us.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        return message
      }
    }
  } else if (account.type === 'Premium') {
    const userId = account.id
    const phone_number = account.phone_number

    // Check if the vehicle belongs to the user
    const vehicleBelongsToUser = await checkIfVehicleBelongsToUser(vehicleRfid, userId)

    if (!vehicleBelongsToUser) {
      throw new Error('Vehicle does not belong to the user')
    }

    // Check if there is an existing entry for the user
    const [existingEntry] = await db.query(
      'SELECT * FROM premium_parking_history WHERE premium_id = ? AND timestamp_out IS NULL ORDER BY timestamp_in DESC LIMIT 1',
      [account.id]
    )

    if (existingEntry.length > 0) {
      const historyId = existingEntry[0].id

      if (hours >= 17) {
        // Add a violation for late time out
        const violationNotes = 'Time out way past 5pm.'
        await db.query('INSERT INTO violations (premium_id, premium_history_id, notes, status) VALUES (?, ?, ?, ?)', [
          userId,
          historyId,
          violationNotes,
          'Unresolved'
        ])

        // Add to notifications about violation
        const notifTitle = 'Late Time Out'

        const notifMessage =
          'You checked out way past 5pm. A violation has been added to your account. Thank you for parking with us.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        // Log for TIME OUT with late violation
        await db.query('UPDATE premium_parking_history SET timestamp_out = NOW() WHERE id = ?', [historyId])
        await db.query('INSERT INTO premium_parking_logs (history_id, action) VALUES (?, ?)', [
          historyId,
          'LATE TIME OUT'
        ])
        message = 'User checked out after 5pm. Violation added for late time out. Thank you for parking with us.'

        return message
      } else {
        // If there's an existing entry with no time_out, update the time_out
        await db.query('UPDATE premium_parking_history SET timestamp_out = NOW() WHERE id = ?', [historyId])
        await db.query('INSERT INTO premium_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'TIME OUT'])
        message = 'User checked out successfully. Thank you for parking with us.'

        // Add to notifications about successful check out
        const notifTitle = 'Time Out'
        const notifMessage = 'You checked out successfully. Thank you for parking with us.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        return message
      }
    } else {
      // Deduct the parking fee from the user's RFID
      const balance = await deductBalance(rfid)

      // check if balance is insufficient
      if (!balance) {
        // Add to notifications about insufficient balance
        const notifTitle = 'Insufficient Balance'
        const notifMessage = 'You have insufficient balance to pay for parking. Please reload your account.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )
        message = 'Insufficient balance. Please reload your account.'

        return message
      } else {
        let notifTitle, notifMessage

        // Add to notifications about deduction
        notifTitle = 'Deduction'
        notifMessage = `You have been charged for parking. Your new balance is Php${balance}.`
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        // If there's no existing entry, create a new one
        const [updateEntry] = await db.query(
          'INSERT INTO premium_parking_history (premium_id, guard_id, vehicle_id, timestamp_in) VALUES (?, ?, ?, NOW())',
          [account.id, guard_id, vehicle_id]
        )
        const historyId = updateEntry.insertId
        await db.query('INSERT INTO premium_parking_logs (history_id, action) VALUES (?, ?)', [historyId, 'TIME IN'])
        message = 'User checked in successfully. Thank you for parking with us.'

        // Add to notifications about successful check in
        notifTitle = 'Time In'
        notifMessage = 'You checked in successfully. Thank you for parking with us.'
        await db.query(
          'INSERT INTO notifications (phone_number, title, message, status, sms_status) VALUES (?, ?, ?, ?, ?)',
          [phone_number, notifTitle, notifMessage, 'unread', 'pending']
        )

        return message
      }
    }
  }
}

const checkIfVehicleBelongsToUser = async (vehicleRfid, userId) => {
  const vehicleData = await db.query(
    `
    SELECT
      vehicles.id,
      vehicles.user_id,
      rfids.value AS rfid,
      rfids.vehicle_id
    FROM vehicles
    JOIN rfids ON rfids.vehicle_id = vehicles.id
    WHERE rfids.value = ? AND (vehicles.user_id = ? OR vehicles.premium_id = ?)
    `,
    [vehicleRfid, userId, userId]
  )

  return vehicleData.length > 0
}

const deductBalance = async rfid => {
  // Fetch parking fee
  const [parkingFeeResult] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = ?', [
    'Parking Fee'
  ])

  if (parkingFeeResult.length === 0) {
    throw new Error('Parking fee not set')
  }

  const parkingFee = parseFloat(parkingFeeResult[0].setting_value)

  const [user] = await db.query('SELECT * FROM rfids WHERE value = ?', [rfid])

  if (user.length > 0) {
    const currentBalance = parseFloat(user[0].load_balance)

    if (currentBalance >= parkingFee) {
      const newBalance = currentBalance - parkingFee
      await db.query('UPDATE rfids SET load_balance = ? WHERE value = ?', [newBalance, rfid])

      return newBalance
    } else {
      return false
    }
  } else {
    throw new Error('RFID not found')
  }
}

const handler = async (req, res) => {
  const { account, vehicleID, guard_id, rfid, vehicleRfid } = req.body

  if (req.method === 'POST') {
    try {
      const message = await parkingAttendance(account, guard_id, vehicleID, rfid, vehicleRfid)

      if (!message) {
        return res.status(404).json({ message: 'Parking Attendance failed' })
      }

      return res.status(200).json(message)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}

export default handler

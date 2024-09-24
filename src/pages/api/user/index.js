import db from '../db'
import dayjs from 'dayjs'

const fetchUsers = async () => {
  try {
    const [users] = await db.query(`
      SELECT users.*, rfids.value as rfid, rfids.load_balance as load_balance, drivers_licenses.license_number, drivers_licenses.expiration
      FROM users
      LEFT JOIN rfids ON users.id = rfids.user_id
      LEFT JOIN drivers_licenses ON users.id = drivers_licenses.user_id
    `)

    return users.map(user => {
      if (user.expiration) {
        user.expiration = dayjs(user.expiration).format('MM/DD/YYYY')
      }

      return user
    })
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const checkRFIDUnique = async (rfid, userID = null, currentUserRfid = null) => {
  let query = `SELECT COUNT(*) as count FROM rfids WHERE value = ?`
  const params = [rfid]

  if (userID && currentUserRfid !== rfid) {
    query += ` AND user_id != ?`
    params.push(userID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const checkLicenseNumberUnique = async (license_number, userID = null, currentLicenseNumber = null) => {
  let query = `SELECT COUNT(*) as count FROM drivers_licenses WHERE license_number = ?`
  const params = [license_number]

  if (userID && currentLicenseNumber !== license_number) {
    query += ` AND user_id != ?`
    params.push(userID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addUser = async data => {
  const {
    last_name,
    first_name,
    middle_name,
    phone_number,
    email_address,
    address,
    image,
    type,
    rfid,
    license_number,
    expiration
  } = data

  const isRfidUnique = await checkRFIDUnique(rfid)
  const isLicenseNumberUnique = await checkLicenseNumberUnique(license_number)

  if (!isRfidUnique) {
    throw new Error('RFID number already in-use')
  }

  if (!isLicenseNumberUnique) {
    throw new Error('License number already exists')
  }

  const today = dayjs()
  const expirationDate = dayjs(expiration)

  if (expirationDate.isBefore(today, 'day')) {
    throw new Error(`The Driver's License is already expired.`)
  } else if (expirationDate.isSame(today, 'day')) {
    throw new Error(`The Driver's License is expiring today.`)
  }

  try {
    const [userResult] = await db.query(
      'INSERT INTO users (last_name, first_name, middle_name, phone_number, email_address, address, image, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [last_name, first_name, middle_name, phone_number, email_address, address, image, type, 'Missing Details']
    )

    const userID = userResult.insertId

    await db.query('INSERT INTO rfids (user_id, value) VALUES (?, ?)', [userID, rfid])

    await db.query('INSERT INTO drivers_licenses (user_id, license_number, expiration) VALUES (?, ?, ?)', [
      userID,
      license_number,
      expirationDate.format('YYYY-MM-DD')
    ])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editUser = async data => {
  const {
    user_id,
    last_name,
    first_name,
    middle_name,
    phone_number,
    email_address,
    address,
    image,
    type,
    rfid,
    license_number,
    expiration
  } = data

  const currentUser = await db.query(
    `SELECT rfids.value as rfid, drivers_licenses.license_number
    FROM users
    LEFT JOIN rfids ON users.id = rfids.user_id
    LEFT JOIN drivers_licenses ON users.id = drivers_licenses.user_id
    WHERE users.id = ?`,
    [user_id]
  )

  if (currentUser.length === 0) {
    throw new Error('User not found')
  }

  const currentUserRfid = currentUser[0].rfid
  const currentLicenseNumber = currentUser[0].license_number

  const isRfidUnique = await checkRFIDUnique(rfid, user_id, currentUserRfid)
  const isLicenseNumberUnique = await checkLicenseNumberUnique(license_number, user_id, currentLicenseNumber)

  if (!isRfidUnique) {
    throw new Error('RFID number already in use')
  }

  if (!isLicenseNumberUnique) {
    throw new Error('License number already exists')
  }

  // Check if the expiration date is not today or already expired
  const today = dayjs()
  const expirationDate = dayjs(expiration)

  if (expirationDate.isBefore(today, 'day')) {
    throw new Error(`The Driver's License is already expired.`)
  } else if (expirationDate.isSame(today, 'day')) {
    throw new Error(`The Driver's License is expiring today.`)
  }

  try {
    await db.query(
      'UPDATE users SET last_name = ?, first_name = ?, middle_name = ?, phone_number = ?, email_address = ?, address = ?, image = ?, type =? WHERE id = ?',
      [last_name, first_name, middle_name, phone_number, email_address, address, image, type, user_id]
    )

    await db.query('UPDATE rfids SET value = ? WHERE user_id = ?', [rfid, user_id])

    await db.query('UPDATE drivers_licenses SET license_number = ?, expiration = ? WHERE user_id = ?', [
      license_number,
      expirationDate.format('YYYY-MM-DD'),
      user_id
    ])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      try {
        const users = await fetchUsers()

        if (!users) return res.status(404).json({ message: 'No users found' })

        return res.status(200).json(users)
      } catch (error) {
        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'POST') {
      const { formData } = req.body
      try {
        const user = await addUser(formData)

        if (!user) return res.status(400).json({ message: 'Failed to add user' })

        return res.status(200).json({ message: 'User added successfully' })
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      try {
        const user = await editUser(formData)

        if (!user) return res.status(400).json({ message: 'Failed to edit user' })

        return res.status(200).json({ message: 'User edited successfully' })
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

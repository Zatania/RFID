import db from '../db'
import dayjs from 'dayjs'

const fetchGuardians = async () => {
  try {
    const [users] = await db.query(`
      SELECT guardians.*, rfids.value as rfid, rfids.load_balance as load_balance, drivers_licenses.license_number, drivers_licenses.expiration
      FROM guardians
      LEFT JOIN rfids ON guardians.id = rfids.guardian_id
      LEFT JOIN drivers_licenses ON guardians.id = drivers_licenses.guardian_id
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

const checkRFIDUnique = async (rfid, guardianID = null, currentGuardianRFID = null) => {
  let query = `SELECT COUNT(*) as count FROM rfids WHERE value = ?`
  const params = [rfid]

  if (guardianID && currentGuardianRFID !== rfid) {
    query += ` AND guardian_id != ?`
    params.push(guardianID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const checkLicenseNumberUnique = async (license_number, guardianID = null, currentLicenseNumber = null) => {
  let query = `SELECT COUNT(*) as count FROM drivers_licenses WHERE license_number = ?`
  const params = [license_number]

  if (guardianID && currentLicenseNumber !== license_number) {
    query += ` AND guardian_id != ?`
    params.push(guardianID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addGuardian = async data => {
  const {
    user_id,
    last_name,
    first_name,
    middle_name,
    phone_number,
    email_address,
    address,
    image,
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
      'INSERT INTO guardians (user_id, last_name, first_name, middle_name, phone_number, email_address, address, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, last_name, first_name, middle_name, phone_number, email_address, address, image, 'Missing Details']
    )

    const guardianID = userResult.insertId

    await db.query('INSERT INTO rfids (guardian_id, value) VALUES (?, ?)', [guardianID, rfid])

    await db.query('INSERT INTO drivers_licenses (guardian_id, license_number, expiration) VALUES (?, ?, ?)', [
      guardianID,
      license_number,
      expirationDate.format('YYYY-MM-DD')
    ])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editGuardian = async data => {
  const {
    guardian_id,
    last_name,
    first_name,
    middle_name,
    phone_number,
    email_address,
    address,
    image,
    rfid,
    user_id,
    license_number,
    expiration
  } = data

  const currentGuardian = await db.query(
    `SELECT rfids.value as rfid, drivers_licenses.license_number
    FROM guardians
    LEFT JOIN rfids ON guardians.id = rfids.guardian_id
    LEFT JOIN drivers_licenses ON guardians.id = drivers_licenses.guardian_id
    WHERE guardians.id = ?`,
    [guardian_id]
  )

  if (currentGuardian.length === 0) {
    throw new Error('Guardian not found')
  }

  const currentGuardianRFID = currentGuardian[0].rfid
  const currentLicenseNumber = currentGuardian[0].license_number

  const isRfidUnique = await checkRFIDUnique(rfid, guardian_id, currentGuardianRFID)
  const isLicenseNumberUnique = await checkLicenseNumberUnique(license_number, guardian_id, currentLicenseNumber)

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
      'UPDATE guardians SET last_name = ?, first_name = ?, middle_name = ?, phone_number = ?, email_address = ?, address = ?, image = ?, user_id =? WHERE id = ?',
      [last_name, first_name, middle_name, phone_number, email_address, address, image, user_id, guardian_id]
    )

    await db.query('UPDATE rfids SET value = ? WHERE guardian_id = ?', [rfid, guardian_id])

    await db.query('UPDATE drivers_licenses SET license_number = ?, expiration = ? WHERE guardian_id = ?', [
      license_number,
      expirationDate.format('YYYY-MM-DD'),
      guardian_id
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
        const users = await fetchGuardians()

        if (!users) return res.status(404).json({ message: 'No users found' })

        return res.status(200).json(users)
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'POST') {
      const { formData } = req.body
      try {
        const user = await addGuardian(formData)

        if (!user) return res.status(400).json({ message: 'Failed to add user' })

        return res.status(200).json({ message: 'User added successfully' })
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      try {
        const user = await editGuardian(formData)

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

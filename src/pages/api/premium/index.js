import db from '../db'
import dayjs from 'dayjs'

const fetchPremiums = async () => {
  try {
    const [premiums] = await db.query(`
      SELECT premiums.*, rfids.value as rfid, rfids.load_balance as load_balance, drivers_licenses.license_number, drivers_licenses.expiration
      FROM premiums
      LEFT JOIN rfids ON premiums.id = rfids.premium_id
      LEFT JOIN drivers_licenses ON premiums.id = drivers_licenses.premium_id
    `)

    return premiums.map(premium => {
      if (premium.expiration) {
        premium.expiration = dayjs(premium.expiration).format('MM/DD/YYYY')
      }

      return premium
    })
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const checkRFIDUnique = async (rfid, premiumID = null, currentUserRfid = null) => {
  let query = `SELECT COUNT(*) as count FROM rfids WHERE value = ?`
  const params = [rfid]

  // Exclude current premium's own RFID
  if (premiumID && currentUserRfid !== rfid) {
    query += ` AND premium_id != ?`
    params.push(premiumID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const checkLicenseNumberUnique = async (license_number, premiumID = null, currentLicenseNumber = null) => {
  let query = `SELECT COUNT(*) as count FROM drivers_licenses WHERE license_number = ?`
  const params = [license_number]

  // Exclude current premium's own license number
  if (premiumID && currentLicenseNumber !== license_number) {
    query += ` AND premium_id != ?`
    params.push(premiumID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addPremium = async data => {
  const {
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

  // Check if the expiration date is not today or already expired
  const today = dayjs()
  const expirationDate = dayjs(expiration)

  if (expirationDate.isBefore(today, 'day')) {
    throw new Error(`The Driver's License is already expired.`)
  } else if (expirationDate.isSame(today, 'day')) {
    throw new Error(`The Driver's License is expiring today.`)
  }

  try {
    // Insert into Premiums table
    const [premiumResult] = await db.query(
      'INSERT INTO premiums (last_name, first_name, middle_name, phone_number, email_address, address, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [last_name, first_name, middle_name, phone_number, email_address, address, image, 'Inactive']
    )

    // Get the premium_id from the last insert
    const premiumId = premiumResult.insertId

    // Insert into RFID table
    await db.query('INSERT INTO rfids (premium_id, value) VALUES (?, ?)', [premiumId, rfid])

    // Insert into Driver's Licenses table
    await db.query('INSERT INTO drivers_licenses (premium_id, license_number, expiration) VALUES (?, ?, ?)', [
      premiumId,
      license_number,
      expirationDate.format('YYYY-MM-DD')
    ])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editPremium = async data => {
  const {
    premium_id,
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

  // Check RFID and License Number uniqueness excluding the current premium's RFID and License Number

  const currentPremium = await db.query(
    `SELECT rfids.value as rfid, drivers_licenses.license_number
    FROM premiums
    LEFT JOIN rfids ON premiums.id = rfids.premium_id
    LEFT JOIN drivers_licenses ON premiums.id = drivers_licenses.premium_id
    WHERE premiums.id = ?`,
    [premium_id]
  )

  if (currentPremium.length === 0) {
    throw new Error('Premium User not found')
  }

  const currentUserRfid = currentPremium[0].rfid
  const currentLicenseNumber = currentPremium[0].license_number

  const isRfidUnique = await checkRFIDUnique(rfid, premium_id, currentUserRfid)
  const isLicenseNumberUnique = await checkLicenseNumberUnique(license_number, premium_id, currentLicenseNumber)

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
    // Update Premiums table
    await db.query(
      'UPDATE premiums SET last_name = ?, first_name = ?, middle_name = ?, phone_number = ?, email_address = ?, address = ?, image = ? WHERE id = ?',
      [last_name, first_name, middle_name, phone_number, email_address, address, image, premium_id]
    )

    // Check if the premium_id exists in the 'rfids' table
    const [rfidExists] = await db.query('SELECT 1 FROM rfids WHERE premium_id = ?', [premium_id])

    // If the premium_id does not exist in the 'rfids' table, insert a new record
    if (rfidExists.length === 0) {
      await db.query('INSERT INTO rfids (premium_id, value) VALUES (?, ?)', [premium_id, rfid])

      // update premium status
      await db.query('UPDATE premiums SET status = ? WHERE id = ?', ['Inactive', premium_id])
    } else {
      // If the premium_id exists, update the existing record
      await db.query('UPDATE rfids SET value = ? WHERE premium_id = ?', [rfid, premium_id])
    }

    // Update Driver's Licenses table
    await db.query('UPDATE drivers_licenses SET license_number = ?, expiration = ? WHERE premium_id = ?', [
      license_number,
      expirationDate.format('YYYY-MM-DD'),
      premium_id
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
        const premiums = await fetchPremiums()

        if (!premiums) return res.status(404).json({ message: 'No premiums found' })

        return res.status(200).json(premiums)
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'POST') {
      const { formData } = req.body
      try {
        const premium = await addPremium(formData)

        if (!premium) return res.status(400).json({ message: 'Failed to add premium' })

        return res.status(200).json({ message: 'Premium added successfully' })
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      const premium = await editPremium(formData)

      if (!premium) return res.status(400).json({ message: 'Failed to update premium' })

      return res.status(200).json({ message: 'Premium updated successfully' })
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

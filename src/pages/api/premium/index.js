import db from '../db'
import dayjs from 'dayjs'

const fetchPremiums = async () => {
  try {
    const [premiums] = await db.query(`SELECT * FROM premiums`)

    return premiums
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const checkRFIDUnique = async (rfid, premiumID = null, currentUserRfid = null) => {
  let query = `SELECT COUNT(*) as count FROM rfids WHERE value = ?`
  const params = [rfid]

  // If premiumID is provided and currentUserRfid is different from the new rfid, exclude the current user's own rfid
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

  // If premiumID is provided and currentLicenseNumber is different from the new license number, exclude the current user's own license number
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
    await db.query(
      'INSERT INTO premiums (last_name, first_name, middle_name, phone_number, email_address, address, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [last_name, first_name, middle_name, phone_number, email_address, address, image, 'Missing Details']
    )

    // Insert into RFID table
    await db.query('INSERT INTO rfids (premium_id, value) VALUES (LAST_INSERT_ID(), ?)', [rfid])

    // Insert into Driver's Licenses Table
    await db.query('INSERT INTO drivers_licenses (license_number, expiration) VALUES (?, ?)', [
      license_number,
      expirationDate.format('YYYY-MM-DD')
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
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

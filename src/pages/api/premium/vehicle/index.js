import db from '../db'
import dayjs from 'dayjs'

const checkUnique = async (value, premiumID = null, currentUserValue = null, type = null) => {
  if (!type) {
    throw new Error('Type must be specified: or_number, cr_number, or plate_number')
  }

  let column = type === 'cr_number' ? 'cr_number' : type === 'plate_number' ? 'plate_number' : 'or_number'

  let query = `SELECT COUNT(*) as count FROM vehicles WHERE ${column} = ?`
  const params = [value]

  if (premiumID && currentUserValue !== value) {
    query += ` AND premium_id != ?`
    params.push(premiumID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addVehicle = async data => {
  const { maker, model, color, plate_number, cr_number, or_number, registration_expiration } = data

  const isCR_NUMBERUnique = await checkUnique(cr_number, null, null, 'cr_number')
  const isOR_NUMBERUnique = await checkUnique(or_number, null, null, 'or_number')
  const isPlateNumberUnique = await checkUnique(plate_number, null, null, 'plate_number')

  if (!isCR_NUMBERUnique) {
    throw new Error('CR number already exists')
  }

  if (!isOR_NUMBERUnique) {
    throw new Error('OR number already exists')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Plate number already exists')
  }

  // Check if the expiration date is not today or already expired
  const today = dayjs()
  const expirationDate = dayjs(registration_expiration)

  if (expirationDate.isBefore(today, 'day')) {
    throw new Error(`The Registration is already expired.`)
  } else if (expirationDate.isSame(today, 'day')) {
    throw new Error(`The Registration is expiring today.`)
  }

  try {
    const [vehicleResult] = await db.query(
      'INSERT INTO vehicles (maker, model, color, plate_number, cr_number, or_number, registration_expiration) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [maker, model, color, plate_number, cr_number, or_number, registration_expiration]
    )

    const vehicleID = vehicleResult.insertId

    await db.query('INSERT INTO rfids (vehicle_id, value) VALUES (?, ?)', [vehicleID, rfid])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editVehicle = async data => {
  const { maker, model, color, plate_number, cr_number, or_number, registration_expiration } = data

  const currentVehicle = await db.query(
    `SELECT rfids.value as rfid, drivers_licenses.license_number
    FROM premiums
    LEFT JOIN rfids ON premiums.id = rfids.premium_id
    LEFT JOIN drivers_licenses ON premiums.id = drivers_licenses.premium_id
    WHERE premiums.id = ?`,
    [premium_id]
  )

  if (currentVehicle.length === 0) {
    throw new Error('Vehicle not found')
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

    // Update RFID table
    await db.query('UPDATE rfids SET value = ? WHERE premium_id = ?', [rfid, premium_id])

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
    if (req.method === 'POST') {
      const { formData } = req.body
      try {
        const vehicle = await addVehicle(formData)

        if (!vehicle) return res.status(400).json({ message: 'Failed to add vehicle' })

        return res.status(200).json({ message: 'Vehicle added successfully' })
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      const vehicle = await editVehicle(formData)

      if (!vehicle) return res.status(400).json({ message: 'Failed to update vehicle' })

      return res.status(200).json({ message: 'Vehicle updated successfully' })
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

import db from '../../db'
import dayjs from 'dayjs'

const checkUnique = async (value, vehicleID = null, currentUserValue = null, type = null) => {
  if (!type) {
    throw new Error('Type must be specified: or_number, cr_number, or plate_number')
  }

  let column = type === 'cr_number' ? 'cr_number' : type === 'plate_number' ? 'plate_number' : 'or_number'

  let query = `SELECT COUNT(*) as count FROM vehicles WHERE ${column} = ?`
  const params = [value]

  if (vehicleID && currentUserValue !== value) {
    query += ` AND id != ?`
    params.push(vehicleID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const checkRFIDUnique = async (rfid, vehicleID = null, currentVehicleRFID = null) => {
  let query = `SELECT COUNT(*) as count FROM rfids WHERE value = ?`
  const params = [rfid]

  if (vehicleID && currentVehicleRFID !== rfid) {
    query += ` AND vehicle_id != ?`
    params.push(vehicleID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addVehicle = async data => {
  const { user_id, maker, model, color, image, rfid, plate_number, cr_number, or_number, registration_expiration } =
    data

  const isCR_NUMBERUnique = await checkUnique(cr_number, null, null, 'cr_number')
  const isOR_NUMBERUnique = await checkUnique(or_number, null, null, 'or_number')
  const isPlateNumberUnique = await checkUnique(plate_number, null, null, 'plate_number')
  const isRfidUnique = await checkRFIDUnique(rfid)

  if (!isCR_NUMBERUnique) {
    throw new Error('CR number already exists')
  }

  if (!isOR_NUMBERUnique) {
    throw new Error('OR number already exists')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Plate number already exists')
  }

  if (!isRfidUnique) {
    throw new Error('RFID number already in-use')
  }

  // Check if the expiration date is not today or already expired
  const today = dayjs().startOf('day')
  const expirationDate = dayjs(registration_expiration).startOf('day')

  if (expirationDate.isBefore(today)) {
    throw new Error(`The Registration is already expired.`)
  } else if (expirationDate.isSame(today)) {
    throw new Error(`The Registration is expiring today.`)
  }

  try {
    const [vehicleResult] = await db.query(
      'INSERT INTO vehicles (user_id, maker, model, color, image, plate_number, cr_number, or_number, registration_expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        maker,
        model,
        color,
        image,
        plate_number,
        cr_number,
        or_number,
        dayjs(registration_expiration).format('YYYY-MM-DD')
      ]
    )

    const vehicleID = vehicleResult.insertId

    await db.query('INSERT INTO rfids (vehicle_id, value) VALUES (?, ?)', [vehicleID, rfid])

    const [existingVehicles] = await db.query('SELECT COUNT(*) as count FROM vehicles WHERE user_id = ?', [user_id])

    if (existingVehicles[0].count > 0) {
      await db.query('UPDATE users SET status = ? WHERE id = ?', ['Inactive', user_id])
    }

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editVehicle = async data => {
  const { vehicle_id, maker, model, color, image, rfid, plate_number, cr_number, or_number, registration_expiration } =
    data

  const currentVehicle = await db.query(
    `SELECT vehicles.*, rfids.value as rfid
    FROM vehicles
    LEFT JOIN rfids ON vehicles.id = rfids.vehicle_id
    WHERE vehicle_id = ?`,
    [vehicle_id]
  )

  if (currentVehicle.length === 0) {
    throw new Error('Vehicle not found')
  }

  const currentVehicleRFID = currentVehicle[0].rfid
  const currentPlateNumber = currentVehicle[0].plate_number
  const currentCRNumber = currentVehicle[0].cr_number
  const currentORNumber = currentVehicle[0].or_number

  const isRfidUnique = await checkRFIDUnique(rfid, vehicle_id, currentVehicleRFID)
  const isPlateNumberUnique = await checkUnique(plate_number, vehicle_id, currentPlateNumber, 'plate_number')
  const isCRNumberUnique = await checkUnique(cr_number, vehicle_id, currentCRNumber, 'cr_number')
  const isORNumberUnique = await checkUnique(or_number, vehicle_id, currentORNumber, 'or_number')

  if (!isRfidUnique) {
    throw new Error('RFID number already in use')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Plate number already exists')
  }

  if (!isCRNumberUnique) {
    throw new Error('CR number already exists')
  }

  if (!isORNumberUnique) {
    throw new Error('OR number already exists')
  }

  // Check if the expiration date is not today or already expired
  const today = dayjs().startOf('day')
  const expirationDate = dayjs(registration_expiration).startOf('day')

  if (expirationDate.isBefore(today)) {
    throw new Error(`The Registration is already expired.`)
  } else if (expirationDate.isSame(today)) {
    throw new Error(`The Registration is expiring today.`)
  }

  try {
    await db.query(
      'UPDATE vehicles SET maker = ?, model = ?, color = ?, image = ?, plate_number = ?, cr_number = ?, or_number = ?, registration_expiration = ? WHERE id = ?',
      [
        maker,
        model,
        color,
        image,
        plate_number,
        cr_number,
        or_number,
        dayjs(registration_expiration).format('YYYY-MM-DD'),
        vehicle_id
      ]
    )

    await db.query('UPDATE rfids SET value = ? WHERE vehicle_id = ?', [rfid, vehicle_id])

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

        return res.status(400).json({ message: error.message || 'Failed to add vehicle' })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body

      try {
        const vehicle = await editVehicle(formData)

        if (!vehicle) return res.status(400).json({ message: 'Failed to update vehicle' })

        return res.status(200).json({ message: 'Vehicle updated successfully' })
      } catch (error) {
        console.log(error)

        return res.status(400).json({ message: error.message || 'Failed to update vehicle' })
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

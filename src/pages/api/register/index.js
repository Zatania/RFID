import db from '../db'
import dayjs from 'dayjs'

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
    license_number,
    expiration,
    maker,
    model,
    color,
    plate_number,
    or_number,
    cr_number,
    registration_expiration,
    username,
    password
  } = data

  const isLicenseNumberUnique = await checkLicenseNumberUnique(license_number)
  const isCR_NUMBERUnique = await checkUnique(cr_number, null, null, 'cr_number')
  const isOR_NUMBERUnique = await checkUnique(or_number, null, null, 'or_number')
  const isPlateNumberUnique = await checkUnique(plate_number, null, null, 'plate_number')

  if (!isLicenseNumberUnique) {
    throw new Error('License number already exists')
  }

  if (!isCR_NUMBERUnique) {
    throw new Error('CR number already exists')
  }

  if (!isOR_NUMBERUnique) {
    throw new Error('OR number already exists')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Plate number already exists')
  }

  const today = dayjs()
  const expirationDate = dayjs(expiration)

  if (expirationDate.isBefore(today, 'day')) {
    throw new Error(`The Driver's License is already expired.`)
  } else if (expirationDate.isSame(today, 'day')) {
    throw new Error(`The Driver's License is expiring today.`)
  }

  try {
    if (type === 'Outsider') {
      const [premiumUser] = await db.query(
        'INSERT INTO premiums (last_name, first_name, middle_name, phone_number, email_address, address, image, username, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          last_name,
          first_name,
          middle_name,
          phone_number,
          email_address,
          address,
          image,
          username,
          password,
          'Inactive'
        ]
      )

      const premiumID = premiumUser.insertId

      await db.query('INSERT INTO drivers_licenses (premium_id, license_number, expiration) VALUES (?, ?, ?)', [
        premiumID,
        license_number,
        expirationDate.format('YYYY-MM-DD')
      ])

      await db.query(
        'INSERT INTO vehicles (premium_id, maker, model, color, plate_number, image, cr_number, or_number, registration_expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          premiumID,
          maker,
          model,
          color,
          plate_number,
          'default.png',
          cr_number,
          or_number,
          dayjs(registration_expiration).format('YYYY-MM-DD')
        ]
      )

      return true
    } else {
      const [userResult] = await db.query(
        'INSERT INTO users (last_name, first_name, middle_name, phone_number, email_address, address, image, type, username, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          last_name,
          first_name,
          middle_name,
          phone_number,
          email_address,
          address,
          image,
          type,
          username,
          password,
          'Inactive'
        ]
      )

      const userID = userResult.insertId

      await db.query('INSERT INTO drivers_licenses (user_id, license_number, expiration) VALUES (?, ?, ?)', [
        userID,
        license_number,
        expirationDate.format('YYYY-MM-DD')
      ])

      await db.query(
        'INSERT INTO vehicles (user_id, maker, model, color, plate_number, image, cr_number, or_number, registration_expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userID,
          maker,
          model,
          color,
          plate_number,
          'default.png',
          cr_number,
          or_number,
          dayjs(registration_expiration).format('YYYY-MM-DD')
        ]
      )

      return true
    }
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
        const user = await addUser(formData)

        if (!user) return res.status(400).json({ message: 'Failed to add user' })

        return res.status(200).json({ message: 'Registered successfully' })
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

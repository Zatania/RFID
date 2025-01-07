import db from '../../../db'
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

const findUserInTables = async username => {
  const tables = ['users', 'premiums']

  for (const table of tables) {
    const query = `SELECT * FROM ${table} WHERE username = ?`
    const [result] = await db.query(query, [username])

    if (result.length > 0) {
      return { user: result[0], table }
    }
  }

  return 'User not found'
}

const addVehicle = async data => {
  const { username, maker, model, color, image, plate_number, cr_number, or_number, registration_expiration } = data

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
  const today = dayjs().startOf('day')
  const registrationExpiration = dayjs(registration_expiration).startOf('day')

  if (registrationExpiration.isBefore(today, 'day')) {
    throw new Error(`The Vehicle's Registration is already expired.`)
  } else if (registrationExpiration.isSame(today, 'day')) {
    throw new Error(`The Vehicle's Registration is expiring today.`)
  }

  const foundUser = await findUserInTables(username)

  if (foundUser === 'User not found') {
    throw new Error('User not found')
  }

  const { user, table } = foundUser
  const userIdColumn = table === 'users' ? 'user_id' : 'premium_id'
  const user_id = user.id

  try {
    const [vehicleResult] = await db.query(
      `INSERT INTO vehicles (${userIdColumn}, maker, model, color, image, plate_number, cr_number, or_number, registration_expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    if (!vehicleResult.insertId) {
      throw new Error('Failed to add vehicle')
    }

    const [existingVehicles] = await db.query(`SELECT COUNT(*) as count FROM vehicles WHERE ${userIdColumn} = ?`, [
      user_id
    ])

    if (existingVehicles[0].count > 0) {
      await db.query('UPDATE users SET status = ? WHERE id = ?', ['Inactive', user_id])
    }

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
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

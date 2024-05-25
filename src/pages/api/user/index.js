import db from '../db'

const fetchUsers = async () => {
  try {
    const [users] = await db.query('SELECT * FROM users')

    return users
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const checkUnique = async (field, value, userId = null, currentUserValue = null) => {
  let query = `SELECT COUNT(*) as count FROM users WHERE ${field} = ?`
  const params = [value]

  // If userId is provided and currentUserValue is different from the new value, exclude the current user's own value
  if (userId && currentUserValue !== value) {
    query += ` AND user_id != ?`
    params.push(userId)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addUser = async data => {
  const {
    last_name,
    first_name,
    middle_name,
    phone,
    address,
    image,
    rfid,
    vehicle_maker,
    vehicle_model,
    vehicle_color,
    vehicle_plate_number,
    vehicle_image
  } = data

  const isRfidUnique = await checkUnique('rfid', rfid)
  const isPlateNumberUnique = await checkUnique('vehicle_plate_number', vehicle_plate_number)

  if (!isRfidUnique) {
    throw new Error('RFID number already exists')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Vehicle plate number already exists')
  }

  try {
    await db.query(
      'INSERT INTO users (last_name, first_name, middle_name, phone, address, image, rfid, vehicle_maker, vehicle_model, vehicle_color, vehicle_plate_number, vehicle_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        last_name,
        first_name,
        middle_name,
        phone,
        address,
        image,
        rfid,
        vehicle_maker,
        vehicle_model,
        vehicle_color,
        vehicle_plate_number,
        vehicle_image
      ]
    )

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
    phone,
    address,
    image,
    rfid,
    vehicle_maker,
    vehicle_model,
    vehicle_color,
    vehicle_plate_number,
    vehicle_image
  } = data

  const currentUser = await db.query('SELECT rfid, vehicle_plate_number FROM users WHERE user_id = ?', [user_id])
  const currentUserRfid = currentUser[0].rfid
  const currentUserPlateNumber = currentUser[0].vehicle_plate_number

  // Check uniqueness of RFID excluding the current user's RFID
  const isRfidUnique = await checkUnique('rfid', rfid, user_id, currentUserRfid)

  // Check uniqueness of plate number excluding the current user's plate number
  const isPlateNumberUnique = await checkUnique(
    'vehicle_plate_number',
    vehicle_plate_number,
    user_id,
    currentUserPlateNumber
  )

  if (!isRfidUnique) {
    throw new Error('RFID number already exists')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Vehicle plate number already exists')
  }

  try {
    await db.query(
      'UPDATE users SET last_name = ?, first_name = ?, middle_name = ?, phone = ?, address = ?, image = ?, rfid = ?, vehicle_maker = ?, vehicle_model = ?, vehicle_color = ?, vehicle_plate_number = ?, vehicle_image = ? WHERE user_id = ?',
      [
        last_name,
        first_name,
        middle_name,
        phone,
        address,
        image,
        rfid,
        vehicle_maker,
        vehicle_model,
        vehicle_color,
        vehicle_plate_number,
        vehicle_image,
        user_id
      ]
    )

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
        console.log(error)

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

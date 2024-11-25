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
    username,
    password
  } = data

  const isLicenseNumberUnique = await checkLicenseNumberUnique(license_number)

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
    if (type === 'Outsider') {
      const [premiumUser] = await db.query(
        'INSERT INTO premiums (last_name, first_name, middle_name, phone_number, email_address, address, image, username, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [last_name, first_name, middle_name, phone_number, email_address, address, image, username, password, 'Pending']
      )

      const premiumID = premiumUser.insertId

      await db.query('INSERT INTO drivers_licenses (premium_id, license_number, expiration) VALUES (?, ?, ?)', [
        premiumID,
        license_number,
        expirationDate.format('YYYY-MM-DD')
      ])

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
          'Pending'
        ]
      )

      const userID = userResult.insertId

      await db.query('INSERT INTO drivers_licenses (user_id, license_number, expiration) VALUES (?, ?, ?)', [
        userID,
        license_number,
        expirationDate.format('YYYY-MM-DD')
      ])

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

import db from '../../db'

const constructResponse = user => {
  const userInfo = {
    id: user[0].id,
    last_name: user[0].last_name,
    first_name: user[0].first_name,
    middle_name: user[0].middle_name,
    phone_number: user[0].phone_number,
    email_address: user[0].email_address,
    address: user[0].address,
    image: user[0].image,
    username: user[0].username,
    password: user[0].password,
    status: user[0].status
  }

  const driversLicenseInfo = {
    license_number: user[0].license_number,
    expiration: user[0].expiration
  }

  // Extract and group vehicle information
  const vehicles = user
    .filter(row => row.maker || row.model || row.plate_number) // Exclude rows without vehicle data
    .map(row => ({
      maker: row.maker,
      model: row.model,
      color: row.color,
      image: row.vehicle_image,
      plate_number: row.plate_number,
      or_number: row.or_number,
      cr_number: row.cr_number,
      registration_expiration: row.registration_expiration,
      status: row.vehicle_status
    }))

  // RFID Information
  const rfid = {
    number: user[0].rfid_number,
    load_balance: user[0].load_balance
  }

  return {
    user_info: userInfo,
    license_info: driversLicenseInfo,
    vehicles: vehicles,
    rfid: rfid
  }
}

const findUserInTable = async (username, tableName) => {
  const userColumn = tableName === 'users' ? 'user_id' : 'premium_id'

  const query = `
    SELECT ${tableName}.*,
            drivers_licenses.license_number,
            drivers_licenses.expiration,
            vehicles.maker,
            vehicles.model,
            vehicles.color,
            vehicles.plate_number,
            vehicles.image AS vehicle_image,
            vehicles.or_number,
            vehicles.cr_number,
            vehicles.registration_expiration,
            vehicles.status AS vehicle_status,
            rfids.value AS rfid_number,
            rfids.load_balance AS load_balance
      FROM ${tableName}
      LEFT JOIN drivers_licenses ON ${tableName}.id = drivers_licenses.${userColumn}
      LEFT JOIN vehicles ON ${tableName}.id = vehicles.${userColumn}
      LEFT JOIN rfids ON ${tableName}.id = rfids.${userColumn}
      WHERE ${tableName}.username = ?
      ORDER BY vehicles.registration_expiration ASC
  `
  const [result] = await db.query(query, [username])

  if (result.length === 0) {
    return null
  }

  return result
}

const handler = async (req, res) => {
  const { username } = req.query
  try {
    let user

    // Attempt to find the user in the `users` table
    user = await findUserInTable(username, 'users')
    if (user) {
      return res.status(200).json(constructResponse(user))
    }

    // Attempt to find the user in the `premiums` table
    user = await findUserInTable(username, 'premiums')
    if (user) {
      return res.status(200).json(constructResponse(user))
    }

    res.status(404).json({ message: 'User not found' })
  } catch (error) {
    console.error('Error fetching transaction details:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export default handler

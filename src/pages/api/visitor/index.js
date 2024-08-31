import db from '../db'

const fetchVisitors = async () => {
  try {
    const [visitors] = await db.query(`SELECT * FROM visitors WHERE status = ?`, ['Active'])

    return visitors
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const checkRFIDUnique = async (rfid, visitorID = null, currentUserRfid = null) => {
  let query = `SELECT COUNT(*) as count FROM rfids WHERE value = ?`
  const params = [rfid]

  // If visitorID is provided and currentUserRfid is different from the new rfid, exclude the current user's own rfid
  if (visitorID && currentUserRfid !== rfid) {
    query += ` AND visitor_id != ?`
    params.push(visitorID)
  }

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const checkPlateNumberUnique = async plateNumber => {
  let query = `SELECT COUNT(*) as count FROM vehicles WHERE plate_number = ?`
  const params = [plateNumber]

  const [result] = await db.query(query, params)

  return result[0].count === 0
}

const addVisitor = async data => {
  const {
    last_name,
    first_name,
    middle_name,
    purpose,
    vehicle_maker,
    vehicle_model,
    vehicle_color,
    vehicle_plate_number,
    rfid
  } = data

  const isRfidUnique = await checkRFIDUnique(rfid)
  const isPlateNumberUnique = await checkPlateNumberUnique(vehicle_plate_number)

  if (!isRfidUnique) {
    throw new Error('RFID number already in-use')
  }

  if (!isPlateNumberUnique) {
    throw new Error('Vehicle plate number already exists')
  }

  try {
    await db.query(
      'INSERT INTO visitors (last_name, first_name, middle_name, purpose, vehicle_maker, vehicle_model, vehicle_color, vehicle_plate_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        last_name,
        first_name,
        middle_name,
        purpose,
        vehicle_maker,
        vehicle_model,
        vehicle_color,
        vehicle_plate_number,
        'Active'
      ]
    )

    await db.query('INSERT INTO rfids (visitor_id, value) VALUES (LAST_INSERT_ID(), ?)', [rfid])

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
        const visitors = await fetchVisitors()

        if (!visitors) return res.status(404).json({ message: 'No visitors found' })

        return res.status(200).json(visitors)
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'POST') {
      const { data } = req.body
      try {
        const visitor = await addVisitor(data)

        if (!visitor) return res.status(400).json({ message: 'Failed to add visitor' })

        return res.status(200).json({ message: 'Visitor added successfully' })
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

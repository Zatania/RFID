import db from '../db'

const fetchGuards = async () => {
  const [guards] = await db.query('SELECT * FROM security_guards')

  return guards.map(guard => ({
    guard_id: guard.guard_id,
    first_name: guard.first_name,
    middle_name: guard.middle_name,
    last_name: guard.last_name,
    phone: guard.phone,
    address: guard.address,
    username: guard.username,
    image: guard.image
  }))
}

const addGuard = async data => {
  const { last_name, first_name, middle_name, phone, address, username, password } = data

  try {
    await db.query(
      'INSERT INTO security_guards (last_name, first_name, middle_name, phone, address, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [last_name, first_name, middle_name, phone, address, username, password]
    )

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editGuard = async data => {
  const { guard_id, last_name, first_name, middle_name, phone, address, username } = data

  try {
    await db.query(
      'UPDATE security_guards SET last_name = ?, first_name = ?, middle_name = ?, phone = ?, address = ?, username = ? WHERE guard_id = ?',
      [last_name, first_name, middle_name, phone, address, username, guard_id]
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
        const guards = await fetchGuards()

        if (!guards) return res.status(404).json({ message: 'No security guards found' })

        return res.status(200).json(guards)
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else if (req.method === 'POST') {
      const { data } = req.body
      try {
        const guard = await addGuard(data)

        if (!guard) return res.status(400).json({ message: 'Failed to add security guard' })

        return res.status(200).json({ message: 'Security Guard added successfully' })
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      try {
        const guard = await editGuard(formData)

        if (!guard) return res.status(400).json({ message: 'Failed to edit security guard' })

        return res.status(200).json({ message: 'Security Guard edited successfully' })
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    if (error) {
      return res.status(500).json({ message: error.message })
    } else {
      return res.status(500).json({ message: 'Something went wrong' })
    }
  }
}

export default handler

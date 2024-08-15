import db from '../db'

const fetchAdmins = async () => {
  const [admins] = await db.query('SELECT * FROM admins')

  return admins.map(admin => ({
    admin_id: admin.id,
    first_name: admin.first_name,
    middle_name: admin.middle_name,
    last_name: admin.last_name,
    username: admin.username,
    password: admin.password,
    image: admin.image
  }))
}

const addAdmin = async data => {
  const { last_name, first_name, middle_name, image, username, password } = data

  try {
    await db.query(
      'INSERT INTO admins (last_name, first_name, middle_name, image, username, password) VALUES (?, ?, ?, ?, ?, ?)',
      [last_name, first_name, middle_name, image, username, password]
    )

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editAdmins = async data => {
  const { admin_id, last_name, first_name, middle_name, image, username, password } = data

  try {
    await db.query(
      'UPDATE admins SET last_name = ?, first_name = ?, middle_name = ?, image = ?, username = ?, password = ? WHERE id = ?',
      [last_name, first_name, middle_name, image, username, password, admin_id]
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
        const admins = await fetchAdmins()

        if (!admins) return res.status(404).json({ message: 'No admins found' })

        return res.status(200).json(admins)
      } catch (error) {
        console.log(error)

        if (error) {
          return res.status(500).json({ message: error.message })
        } else {
          return res.status(500).json({ message: 'Something went wrong' })
        }
      }
    } else if (req.method === 'POST') {
      const { formData } = req.body
      try {
        const admin = await addAdmin(formData)

        if (!admin) return res.status(400).json({ message: 'Failed to add admin' })

        return res.status(200).json({ message: 'Admin added successfully' })
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
        const admin = await editAdmins(formData)

        if (!admin) return res.status(400).json({ message: 'Failed to edit admin' })

        return res.status(200).json({ message: 'Admin edited successfully' })
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

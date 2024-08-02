import db from '../db'

const fetchBAOs = async () => {
  const [baos] = await db.query('SELECT * FROM baos')

  return baos.map(bao => ({
    bao_id: bao.id,
    first_name: bao.first_name,
    middle_name: bao.middle_name,
    last_name: bao.last_name,
    username: bao.username,
    password: bao.password,
    image: bao.image
  }))
}

const addBAO = async data => {
  const { last_name, first_name, middle_name, image, username, password } = data

  try {
    await db.query(
      'INSERT INTO baos (last_name, first_name, middle_name, image, username, password) VALUES (?, ?, ?, ?, ?, ?)',
      [last_name, first_name, middle_name, image, username, password]
    )

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const editBAO = async data => {
  const { bao_id, last_name, first_name, middle_name, image, username, password } = data

  try {
    await db.query(
      'UPDATE baos SET last_name = ?, first_name = ?, middle_name = ?, image = ?, username = ?, password = ? WHERE id = ?',
      [last_name, first_name, middle_name, image, username, password, bao_id]
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
        const baos = await fetchBAOs()

        if (!baos) return res.status(404).json({ message: 'No BAOs found' })

        return res.status(200).json(baos)
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
        const bao = await addBAO(formData)

        if (!bao) return res.status(400).json({ message: 'Failed to add BAO' })

        return res.status(200).json({ message: 'BAO added successfully' })
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
        const bao = await editBAO(formData)

        if (!bao) return res.status(400).json({ message: 'Failed to edit BAO' })

        return res.status(200).json({ message: 'BAO edited successfully' })
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

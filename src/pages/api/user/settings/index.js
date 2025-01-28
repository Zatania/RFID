import db from '../../db'

const updateUserInfo = async updatedData => {
  const { id, last_name, first_name, middle_name, image, username } = updatedData

  try {
    const [user] = await db.query(
      `
      UPDATE users
      SET last_name = ?,
          first_name = ?,
          middle_name = ?,
          image = ?,
          username = ?
      WHERE id = ?;
      `,
      [last_name, first_name, middle_name, image, username, id]
    )

    if (!user) return false

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const { updatedData } = req.body
      try {
        const user = await updateUserInfo(updatedData)

        if (!user) return res.status(400).json({ message: 'Failed to fetch user information' })

        return res.status(200).json({ message: 'User information updated successfully' })
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

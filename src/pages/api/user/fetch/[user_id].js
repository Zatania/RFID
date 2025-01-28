import db from '../../db'

const fetchUserInfo = async user_id => {
  try {
    const [user] = await db.query(
      `
      SELECT
        id,
        last_name,
        first_name,
        middle_name,
        image,
        username
      FROM
        users
      WHERE id = ?
      `,
      [user_id]
    )

    return user
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query
      try {
        const user = await fetchUserInfo(user_id)

        if (!user) return res.status(400).json({ message: 'Failed to fetch user information' })

        return res.status(200).json(user[0])
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

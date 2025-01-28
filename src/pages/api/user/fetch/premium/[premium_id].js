import db from '../../../db'

const fetchPremiumInfo = async premium_id => {
  try {
    const [premium] = await db.query(
      `
      SELECT
        id,
        last_name,
        first_name,
        middle_name,
        image,
        username
      FROM
        premiums
      WHERE id = ?
      `,
      [premium_id]
    )

    return premium
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { premium_id } = req.query
      try {
        const premium = await fetchPremiumInfo(premium_id)

        if (!premium) return res.status(400).json({ message: 'Failed to fetch premium information' })

        return res.status(200).json(premium[0])
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

import db from '../../db'

const fetchPremiumCount = async () => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS count FROM premiums')

    return result[0].count
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const adminCount = await fetchPremiumCount()

      res.status(200).json(adminCount)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

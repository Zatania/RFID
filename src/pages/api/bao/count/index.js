import db from '../../db'

const fetchBAOCount = async () => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS count FROM baos')

    return result[0].count
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const baoCount = await fetchBAOCount()

      res.status(200).json(baoCount)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

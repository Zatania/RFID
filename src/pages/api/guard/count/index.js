import db from '../../db'

const fetchGuardCount = async () => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS count FROM security_guards')

    return result[0].count
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const guardCount = await fetchGuardCount()

      res.status(200).json(guardCount)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

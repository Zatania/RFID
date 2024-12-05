import db from '../../db'

const fetchUserLogsCount = async () => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS count FROM user_parking_logs')

    return result[0].count
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const userCount = await fetchUserLogsCount()

      res.status(200).json(userCount)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

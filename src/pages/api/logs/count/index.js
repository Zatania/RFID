import db from '../../db'

// Fetch log count for a specific table
const fetchLogsCount = async tableName => {
  try {
    const [result] = await db.query(`SELECT COUNT(*) AS count FROM ??`, [tableName])

    return result[0].count
  } catch (error) {
    console.error(`SQL Error fetching count for table ${tableName}:`, error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Fetch counts from all three tables
      const userCount = await fetchLogsCount('user_parking_logs')
      const visitorCount = await fetchLogsCount('visitor_parking_logs')
      const premiumCount = await fetchLogsCount('premium_parking_logs')

      // Calculate the overall count
      const overallCount = userCount + visitorCount + premiumCount

      // Respond with the overall count
      res.status(200).json(overallCount)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export default handler

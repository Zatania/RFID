import db from '../../db'

const updateAttendance = async (user_id, guard_id) => {
  try {
    await db.query('INSERT INTO logs (user_id, guard_id) VALUES (?, ?)', user_id, guard_id)
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const { user_id, guard_id } = req.body

    try {
      await updateAttendance(user_id, guard_id)

      res.status(200).json({ message: 'User successfully timed in/out' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default handler

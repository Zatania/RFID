import db from '../db'

const deleteVisitor = async visitor_id => {
  try {
    await db.query('DELETE FROM visitors WHERE id = ?', [visitor_id])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { visitor_id } = req.query
      try {
        const visitor = await deleteVisitor(visitor_id)

        if (!visitor) return res.status(400).json({ message: 'Failed to delete visitor' })

        return res.status(200).json({ message: 'Visitor deleted successfully' })
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

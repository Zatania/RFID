import db from '../db'

const deletePremium = async premium_id => {
  try {
    await db.query('DELETE FROM premiums WHERE id = ?', [premium_id])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { premium_id } = req.query
      try {
        const premium = await deletePremium(premium_id)

        if (!premium) return res.status(400).json({ message: 'Failed to delete premium user' })

        return res.status(200).json({ message: 'Premium User deleted successfully' })
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

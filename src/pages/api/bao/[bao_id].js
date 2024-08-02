import db from '../db'

const deleteGuard = async bao_id => {
  try {
    await db.query('DELETE FROM baos WHERE id = ?', [bao_id])

    return true
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const { bao_id } = req.query
      console.log('bao_id:', bao_id)
      try {
        const guard = await deleteGuard(bao_id)

        if (!guard) return res.status(400).json({ message: 'Failed to delete bao' })

        return res.status(200).json({ message: 'BAO deleted successfully' })
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

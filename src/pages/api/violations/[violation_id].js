import db from '../db'

const handler = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const { violation_id } = req.query
      const { status } = req.body

      try {
        await db.query(
          `
          UPDATE violations
          SET status = ?
          WHERE id = ?
        `,
          [status, violation_id]
        )

        res.status(200).json({ message: 'Violation status updated successfully.' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default handler

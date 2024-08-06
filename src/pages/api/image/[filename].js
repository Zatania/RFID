import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

const handler = async (req, res) => {
  const { filename } = req.query

  // Set the directory where your images are stored
  const filePath = path.resolve('./uploads', filename)
  try {
    if (req.method === 'DELETE') {
      if (!filename) {
        return res.status(400).json({ error: 'File Name is required' })
      }

      try {
        fs.unlink(filePath, err => {
          if (err) {
            console.error(err)

            return res.status(500).json({ error: 'Failed to delete image' })
          }
        })

        res.status(200).json({ message: 'Image deleted successfully' })
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to delete image' })
      }
    } else if (req.method === 'GET') {
      const mimeType = mime.lookup(filePath) || 'application/octet-stream'

      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err)

          return res.status(404).json({ error: 'Image not found' })
        }

        res.setHeader('Content-Type', mimeType)
        res.send(data)
      })
    } else {
      res.status(405).json({ error: 'Method Not Allowed' })
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

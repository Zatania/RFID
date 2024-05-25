import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { filename } = req.query

  // Set the directory where your images are stored
  const filePath = path.resolve('./uploads', filename)

  // Read the image file from the file system
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).json({ error: 'Image not found' })

      return
    }

    // Set the content type to the image type (e.g., image/jpeg, image/png)
    res.setHeader('Content-Type', 'image') // Modify as needed
    res.send(data)
  })
}

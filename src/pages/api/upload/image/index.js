import formidable from 'formidable'
import path from 'path'
import fs from 'fs/promises'

export const config = {
  api: {
    bodyParser: false
  }
}

const readFile = (req, saveLocally) => {
  const options = {}
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), '/uploads')
    options.filename = (name, ext, path) => {
      return Date.now().toString() + '_' + path.originalFilename
    }
  }
  options.maxFileSize = 100 * 1024 * 1024
  const form = formidable(options)

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}

const handler = async (req, res) => {
  try {
    const uploadDir = path.join(process.cwd(), '/uploads')
    await fs.readdir(uploadDir).catch(() => fs.mkdir(uploadDir))

    const file = await readFile(req, true)
    const myImage = file.files.myImage

    if (Array.isArray(myImage) && myImage.length > 0) {
      const fullPath = myImage[0].filepath
      const relativePath = path.relative(uploadDir, fullPath)
      res.json({ imagePath: relativePath.replace(/\\/g, '/') })
    } else {
      res.status(400).json({ error: 'No image uploaded' })
    }
  } catch (error) {
    console.error('Error in upload handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler

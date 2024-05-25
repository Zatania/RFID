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
  options.maxFileSize = 4000 * 1024 * 1024
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
    await fs.readdir(path.join(process.cwd(), '/uploads'))
  } catch (error) {
    await fs.mkdir(path.join(process.cwd(), '/uploads'))
  }

  try {
    const file = await readFile(req, true)
    const myImage = file.files.myImage
    if (Array.isArray(myImage) && myImage.length > 0) {
      const fullPath = myImage[0].filepath
      const relativePath = path.relative(path.join(process.cwd(), 'uploads'), fullPath)

      res.json({ imagePath: relativePath.replace(/\\/g, '/') })
    }
  } catch (error) {
    console.log(error)
    console.error(error)
  }
}

export default handler

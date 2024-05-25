import * as bcrypt from 'bcryptjs'
import db from '../db'

const comparePasswords = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword)
}

const findUserInTable = async (username, password, tableName, role) => {
  const query = `SELECT * FROM ${tableName} WHERE username = ?`
  const [result] = await db.query(query, [username])

  if (result.length === 0) {
    return null
  }

  const user = result[0]
  const isPasswordMatch = await comparePasswords(password, user.password)

  if (isPasswordMatch) {
    user.role = role

    return user
  }

  return null
}

const findUser = async (username, password) => {
  let user

  user = await findUserInTable(username, password, 'admins', 'admin')
  if (user) {
    return user
  }

  user = await findUserInTable(username, password, 'security_guards', 'security_guard')
  if (user) {
    return user
  }

  return null
}

const handler = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await findUser(username, password)

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    return res.status(200).json(user)
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

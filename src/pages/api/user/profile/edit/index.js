import db from '../../../db'
import * as bcrypt from 'bcryptjs'

const comparePasswords = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword)
}

const findUserInTables = async username => {
  const tables = ['users', 'premiums']

  for (const table of tables) {
    const query = `SELECT * FROM ${table} WHERE username = ?`
    const [result] = await db.query(query, [username])

    if (result.length > 0) {
      return { user: result[0], table }
    }
  }

  return 'User not found'
}

const editProfileInfo = async data => {
  const { last_name, first_name, middle_name, username, current_password, new_password } = data

  if (current_password && new_password) {
    const foundUser = await findUserInTables(username)

    if (foundUser === 'User not found') {
      throw new Error('User not found')
    }

    const { user, table } = foundUser
    const isPasswordMatch = await comparePasswords(current_password, user.password)

    if (!isPasswordMatch) {
      throw new Error('Invalid password')
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)

    try {
      await db.query(
        `UPDATE ${table} SET last_name = ?, first_name = ?, middle_name = ?, password = ? WHERE username = ?`,
        [last_name, first_name, middle_name, hashedPassword, username]
      )

      return true
    } catch (error) {
      console.error('SQL Error:', error)
      throw error
    }
  } else {
    const foundUser = await findUserInTables(username)

    if (foundUser === 'User not found') {
      throw new Error('User not found')
    }

    const { table } = foundUser

    try {
      await db.query(`UPDATE ${table} SET last_name = ?, first_name = ?, middle_name = ? WHERE username = ?`, [
        last_name,
        first_name,
        middle_name,
        username
      ])

      return true
    } catch (error) {
      console.error('SQL Error:', error)
      throw error
    }
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const { data } = req.body
      try {
        const success = await editProfileInfo(data)

        if (!success) {
          return res.status(400).json({ message: 'Failed to update user profile' })
        }

        return res.status(200).json({ message: 'User profile updated successfully' })
      } catch (error) {
        console.log(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

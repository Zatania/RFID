import db from '../../db'
import * as bcrypt from 'bcryptjs'

const comparePasswords = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword)
}

const editBAOPassword = async (bao_id, data) => {
  const { current_password, new_password } = data

  if (!current_password || !new_password) {
    throw new Error('Current and new passwords are required')
  }

  try {
    // Fetch the user from the baos table
    const [user] = await db.query('SELECT password FROM baos WHERE id = ?', [bao_id])
    if (!user[0]) {
      throw new Error('User not found')
    }

    if (!user[0].password) {
      throw new Error('Password is missing in the database')
    }

    // Compare current password with the stored hash
    const isPasswordMatch = await comparePasswords(current_password, user[0].password)
    if (!isPasswordMatch) {
      throw new Error('Invalid current password')
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update the password in the baos table
    await db.query('UPDATE baos SET password = ? WHERE id = ?', [hashedPassword, bao_id])

    return true
  } catch (error) {
    console.error('Error updating password:', error.message)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const { bao_id } = req.query
      const { data } = req.body
      try {
        const success = await editBAOPassword(bao_id, data)

        if (!success) {
          return res.status(400).json({ message: 'Failed to update bao password' })
        }

        return res.status(200).json({ message: 'BAO password updated successfully' })
      } catch (error) {
        console.error(error)

        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error(error)

    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export default handler

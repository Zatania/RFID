import db from '../../db'

const activateAccount = async ({ id, load_balance, account_type }) => {
  let accountQuery
  let rfidQuery

  if (load_balance <= 0) {
    throw new Error('Load balance must be greater than 0')
  }

  switch (account_type) {
    case 'User':
      accountQuery = 'UPDATE users SET status = "Active" WHERE id = ?'
      break
    case 'Premium':
      accountQuery = 'UPDATE premiums SET status = "Active" WHERE id = ?'
      break
    case 'Guardian':
      accountQuery = 'UPDATE guardians SET status = "Active" WHERE id = ?'
      break
    default:
      throw new Error('Invalid account type')
  }

  rfidQuery = 'UPDATE rfids SET load_balance = ? WHERE user_id = ? OR premium_id = ? OR guardian_id = ?'

  const [accountResult] = await db.query(accountQuery, [id])

  const [rfidResult] = await db.query(rfidQuery, [load_balance, id, id, id])

  return accountResult.affectedRows > 0 && rfidResult.affectedRows > 0
}

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      try {
        res.status(200).json('No data')
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    } else if (req.method === 'PUT') {
      const { formData } = req.body
      try {
        const accountActivated = await activateAccount(formData)

        if (!accountActivated) return res.status(400).json({ message: 'Failed to activate account' })

        return res.status(200).json({ message: 'Account activated successfully' })
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

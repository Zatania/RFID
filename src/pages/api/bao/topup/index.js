import db from '../../db'

const topupAcount = async ({ id, bao_id, load_amount, account_type }) => {
  let rfidQuery, historyQuery

  if (load_amount <= 0) {
    throw new Error('Load amount must be greater than 0')
  }

  switch (account_type) {
    case 'User':
      rfidQuery = 'UPDATE rfids SET load_balance = load_balance + ? WHERE user_id = ?'
      historyQuery = 'INSERT INTO topup_history (user_id, bao_id, load_amount) VALUES (?, ?, ?)'
      break
    case 'Premium':
      rfidQuery = 'UPDATE rfids SET load_balance = load_balance + ? WHERE premium_id = ?'
      historyQuery = 'INSERT INTO topup_history (premium_id, bao_id, load_amount) VALUES (?, ?, ?)'
      break
    default:
      throw new Error('Invalid account type')
  }

  await db.query(rfidQuery, [load_amount, id])

  await db.query(historyQuery, [id, bao_id, load_amount])

  return true
}

const handler = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const { formData } = req.body
      try {
        const accountActivated = await topupAcount(formData)

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

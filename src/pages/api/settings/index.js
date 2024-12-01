import db from '../db'

const fetchSettings = async () => {
  try {
    const [settings] = await db.query(`
      SELECT id, setting_key, setting_value, description
      FROM system_settings
    `)

    // Format settings to only return setting_key, setting_value, and description
    return settings.map(setting => ({
      id: setting.id,
      setting_key: setting.setting_key,
      setting_value: setting.setting_value,
      description: setting.description
    }))
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const saveSettings = async (id, setting_value, description) => {
  try {
    const [result] = await db.query(
      `
      UPDATE system_settings
      SET setting_value = ?, description = ?
      WHERE id = ?
    `,
      [setting_value, description, id]
    )

    if (result.affectedRows === 0) {
      throw new Error('Setting not found')
    }

    return { id, setting_value, description }
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      try {
        const settings = await fetchSettings()

        if (!settings || settings.length === 0) {
          return res.status(404).json({ message: 'No settings found' })
        }

        return res.status(200).json(settings)
      } catch (error) {
        return res.status(500).json({ message: error.message || 'Something went wrong' })
      }
    } else if (req.method === 'PUT') {
      const { id, setting_value, description } = req.body

      if (!id || !setting_value || !description) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      try {
        const setting = await saveSettings(id, setting_value, description)

        return res.status(200).json(setting)
      } catch (error) {
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

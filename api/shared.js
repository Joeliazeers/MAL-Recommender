import { sql } from './_db.js'

const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { code } = req.query
      const rows = await sql`SELECT * FROM shared_recommendations WHERE share_code = ${code} LIMIT 1`
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(rows[0])
    }

    if (req.method === 'POST') {
      const { userId, type, mode, recommendations } = req.body
      const shareCode = generateShareCode()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const rows = await sql`
        INSERT INTO shared_recommendations (share_code, type, mode, recommendations, created_by, expires_at)
        VALUES (${shareCode}, ${type}, ${mode}, ${JSON.stringify(recommendations)}, ${userId}, ${expiresAt})
        RETURNING *
      `
      return res.status(200).json(rows[0])
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

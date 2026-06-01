import { sql } from './_db.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // upsert user
      const { mal_id, username, avatar_url, access_token, refresh_token, token_expires_at } = req.body
      const rows = await sql`
        INSERT INTO users (mal_id, username, avatar_url, access_token, refresh_token, token_expires_at, updated_at)
        VALUES (${mal_id}, ${username}, ${avatar_url}, ${access_token}, ${refresh_token}, ${token_expires_at}, NOW())
        ON CONFLICT (mal_id) DO UPDATE SET
          username = EXCLUDED.username,
          avatar_url = EXCLUDED.avatar_url,
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          token_expires_at = EXCLUDED.token_expires_at,
          updated_at = NOW()
        RETURNING *
      `
      return res.status(200).json(rows[0])
    }

    if (req.method === 'GET') {
      const { malId } = req.query
      const rows = await sql`SELECT * FROM users WHERE mal_id = ${malId} LIMIT 1`
      return res.status(200).json(rows[0] || null)
    }

    if (req.method === 'PATCH') {
      // update tokens
      const { malId } = req.query
      const { access_token, refresh_token, token_expires_at } = req.body
      const rows = await sql`
        UPDATE users SET
          access_token = ${access_token},
          refresh_token = ${refresh_token},
          token_expires_at = ${token_expires_at},
          updated_at = NOW()
        WHERE mal_id = ${malId}
        RETURNING *
      `
      return res.status(200).json(rows[0])
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

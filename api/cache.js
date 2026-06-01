import { sql } from './_db.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId, itemType, mode } = req.query
      const rows = await sql`
        SELECT * FROM recommendation_cache
        WHERE user_id = ${userId}
          AND type = ${itemType}
          AND mode = ${mode}
          AND expires_at > NOW()
        ORDER BY computed_at DESC
        LIMIT 1
      `
      return res.status(200).json(rows[0] || null)
    }

    if (req.method === 'POST') {
      const { userId, itemType, mode, recommendations, metadata } = req.body
      const algorithm = metadata?.algorithm || 'hybrid'
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()

      const rows = await sql`
        INSERT INTO recommendation_cache
          (user_id, type, mode, algorithm, recommendations, computed_at, expires_at)
        VALUES
          (${userId}, ${itemType}, ${mode}, ${algorithm}, ${JSON.stringify(recommendations)}, NOW(), ${expiresAt})
        ON CONFLICT (user_id, type, mode, algorithm) DO UPDATE SET
          recommendations = EXCLUDED.recommendations,
          computed_at = NOW(),
          expires_at = EXCLUDED.expires_at
        RETURNING *
      `
      return res.status(200).json(rows[0])
    }

    if (req.method === 'DELETE') {
      const { userId, itemType, expired } = req.query
      if (expired === 'true') {
        await sql`DELETE FROM recommendation_cache WHERE expires_at < NOW()`
      } else if (itemType) {
        await sql`DELETE FROM recommendation_cache WHERE user_id = ${userId} AND type = ${itemType}`
      } else {
        await sql`DELETE FROM recommendation_cache WHERE user_id = ${userId}`
      }
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

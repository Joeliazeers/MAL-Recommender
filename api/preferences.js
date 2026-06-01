import { sql } from './_db.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId } = req.query
      const rows = await sql`SELECT * FROM user_preferences WHERE user_id = ${userId} LIMIT 1`
      return res.status(200).json(rows[0] || null)
    }

    if (req.method === 'POST') {
      const { userId, favorite_genres, excluded_genres, preferred_studios, preferred_authors, min_score, preferred_media_types } = req.body
      const rows = await sql`
        INSERT INTO user_preferences
          (user_id, favorite_genres, excluded_genres, preferred_studios, preferred_authors, min_score, preferred_media_types, updated_at)
        VALUES
          (${userId}, ${JSON.stringify(favorite_genres || [])}, ${JSON.stringify(excluded_genres || [])},
           ${JSON.stringify(preferred_studios || [])}, ${JSON.stringify(preferred_authors || [])},
           ${min_score || 7.0}, ${JSON.stringify(preferred_media_types || [])}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          favorite_genres = EXCLUDED.favorite_genres,
          excluded_genres = EXCLUDED.excluded_genres,
          preferred_studios = EXCLUDED.preferred_studios,
          preferred_authors = EXCLUDED.preferred_authors,
          min_score = EXCLUDED.min_score,
          preferred_media_types = EXCLUDED.preferred_media_types,
          updated_at = NOW()
        RETURNING *
      `
      return res.status(200).json(rows[0])
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

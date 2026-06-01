import { sql } from './_db.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId, itemId, itemType } = req.query

      if (itemId) {
        const rows = itemType === 'anime'
          ? await sql`SELECT * FROM user_feedback WHERE user_id = ${userId} AND anime_id = ${itemId} LIMIT 1`
          : await sql`SELECT * FROM user_feedback WHERE user_id = ${userId} AND manga_id = ${itemId} LIMIT 1`
        return res.status(200).json(rows[0] || null)
      }

      const rows = itemType
        ? await sql`SELECT * FROM user_feedback WHERE user_id = ${userId} AND item_type = ${itemType} ORDER BY created_at DESC`
        : await sql`SELECT * FROM user_feedback WHERE user_id = ${userId} ORDER BY created_at DESC`
      return res.status(200).json(rows)
    }

    if (req.method === 'POST') {
      const { userId, itemId, itemType, feedbackType, rating } = req.body
      const animeId = itemType === 'anime' ? itemId : null
      const mangaId = itemType === 'manga' ? itemId : null

      let rows
      if (itemType === 'anime') {
        rows = await sql`
          INSERT INTO user_feedback (user_id, anime_id, manga_id, item_type, feedback_type, rating, created_at)
          VALUES (${userId}, ${animeId}, ${mangaId}, ${itemType}, ${feedbackType}, ${rating ?? null}, NOW())
          ON CONFLICT (user_id, anime_id) WHERE anime_id IS NOT NULL
          DO UPDATE SET feedback_type = EXCLUDED.feedback_type, rating = EXCLUDED.rating
          RETURNING *
        `
      } else {
        rows = await sql`
          INSERT INTO user_feedback (user_id, anime_id, manga_id, item_type, feedback_type, rating, created_at)
          VALUES (${userId}, ${animeId}, ${mangaId}, ${itemType}, ${feedbackType}, ${rating ?? null}, NOW())
          ON CONFLICT (user_id, manga_id) WHERE manga_id IS NOT NULL
          DO UPDATE SET feedback_type = EXCLUDED.feedback_type, rating = EXCLUDED.rating
          RETURNING *
        `
      }
      return res.status(200).json(rows[0])
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

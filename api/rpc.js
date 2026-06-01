import { sql } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { fn } = req.query

  try {
    if (fn === 'match_similar_users') {
      const { target_user_id, item_type = 'anime', min_similarity = 0.2, limit_count = 10 } = req.body
      const rows = await sql`
        SELECT * FROM match_similar_users(${target_user_id}, ${item_type}, ${min_similarity}, ${limit_count})
      `
      return res.status(200).json(rows)
    }

    if (fn === 'get_collaborative_recommendations') {
      const { target_user_id, item_type = 'anime', user_list_ids = [], limit_count = 10 } = req.body
      const rows = await sql`
        SELECT * FROM get_collaborative_recommendations(${target_user_id}, ${item_type}, ${user_list_ids}, ${limit_count})
      `
      return res.status(200).json(rows)
    }

    return res.status(400).json({ error: 'Unknown function' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

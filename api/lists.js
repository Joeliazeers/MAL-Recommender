import { sql } from './_db.js'

const BATCH = 50

export default async function handler(req, res) {
  const { userId, type } = req.query

  try {
    if (req.method === 'GET') {
      if (type === 'manga') {
        const rows = await sql`SELECT * FROM user_manga_list WHERE user_id = ${userId}`
        return res.status(200).json(rows)
      }
      const rows = await sql`SELECT * FROM user_anime_list WHERE user_id = ${userId}`
      return res.status(200).json(rows)
    }

    if (req.method === 'POST') {
      const { items } = req.body

      if (type === 'manga') {
        await sql`DELETE FROM user_manga_list WHERE user_id = ${userId}`
        if (!items || items.length === 0) return res.status(200).json({ count: 0 })

        const rows = items.map(item => ({
          user_id: userId,
          mal_manga_id: item.node.id,
          title: item.node.title,
          image_url: item.node.main_picture?.medium || item.node.main_picture?.large || null,
          score: item.list_status?.score || 0,
          status: item.list_status?.status || null,
          genres: JSON.stringify(item.node.genres || []),
          authors: JSON.stringify(item.node.authors || []),
          mean_score: item.node.mean || null,
          popularity: item.node.popularity || null,
          num_chapters: item.node.num_chapters || null,
          num_volumes: item.node.num_volumes || null,
          media_type: item.node.media_type || null,
          cached_at: new Date().toISOString(),
        }))

        for (let i = 0; i < rows.length; i += BATCH) {
          await sql`INSERT INTO user_manga_list ${sql(rows.slice(i, i + BATCH))}`
        }
        return res.status(200).json({ count: rows.length })
      }

      // anime
      await sql`DELETE FROM user_anime_list WHERE user_id = ${userId}`
      if (!items || items.length === 0) return res.status(200).json({ count: 0 })

      const rows = items.map(item => ({
        user_id: userId,
        mal_anime_id: item.node.id,
        title: item.node.title,
        image_url: item.node.main_picture?.medium || item.node.main_picture?.large || null,
        score: item.list_status?.score || 0,
        status: item.list_status?.status || null,
        genres: JSON.stringify(item.node.genres || []),
        studios: JSON.stringify(item.node.studios || []),
        mean_score: item.node.mean || null,
        popularity: item.node.popularity || null,
        season: item.node.start_season?.season || null,
        year: item.node.start_season?.year || null,
        num_episodes: item.node.num_episodes || null,
        media_type: item.node.media_type || null,
        cached_at: new Date().toISOString(),
      }))

      for (let i = 0; i < rows.length; i += BATCH) {
        await sql`INSERT INTO user_anime_list ${sql(rows.slice(i, i + BATCH))}`
      }
      return res.status(200).json({ count: rows.length })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

import { sql } from './_db.js'

export default async function handler(req, res) {
  await sql`SELECT 1`
  res.status(200).json({ ok: true })
}

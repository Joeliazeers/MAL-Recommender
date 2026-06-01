import { Pool, neonConfig } from '@neondatabase/serverless'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const __dirname = dirname(fileURLToPath(import.meta.url))

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Usage: node scripts/migrate.mjs <connection-string>')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

const migrationsDir = join(__dirname, '../supabase/migrations')
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

console.log(`Running ${files.length} migrations...\n`)

for (const file of files) {
  const content = readFileSync(join(migrationsDir, file), 'utf8')
  try {
    await pool.query(content)
    console.log(`✓ ${file}`)
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`)
    process.exit(1)
  }
}

await pool.end()
console.log('\nAll migrations complete.')

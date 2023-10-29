import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema.ts',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './src/storage.db'
  },
  out: './drizzle',
}

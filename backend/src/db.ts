import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgres://user:password@postgres:5432/projectdb'
})

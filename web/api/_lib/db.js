import { neon } from '@neondatabase/serverless';

let sql;

export function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum diisi di Vercel.');
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

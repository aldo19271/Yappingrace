import bcrypt from 'bcryptjs';
import { getSql } from './_lib/db.js';
import { signUser, publicUser, send, fail } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      return send(res, 400, { error: 'Username 3-16 karakter: huruf, angka, atau underscore.' });
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
      return send(res, 400, { error: 'Password minimal 6 karakter.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const sql = getSql();
    const rows = await sql`
      insert into users (username, password_hash)
      values (${username}, ${hash})
      on conflict do nothing
      returning id, username, coins, wins, equipped_skin`;
    if (rows.length === 0) return send(res, 409, { error: 'Username sudah dipakai.' });
    return send(res, 200, { token: signUser(rows[0]), user: publicUser(rows[0], []) });
  } catch (err) {
    return fail(res, err);
  }
}

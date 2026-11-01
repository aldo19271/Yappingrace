import bcrypt from 'bcryptjs';
import { getSql } from './_lib/db.js';
import { signUser, publicUser, send, fail } from './_lib/auth.js';
import { normalizeEmail } from './_lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const { username, email: rawEmail, password } = req.body || {};
    if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      return send(res, 400, { error: 'Username 3-16 karakter: huruf, angka, atau underscore.' });
    }
    const email = normalizeEmail(rawEmail);
    if (!email) return send(res, 400, { error: 'Isi Gmail yang valid (contoh: nama@gmail.com).' });
    if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
      return send(res, 400, { error: 'Password minimal 6 karakter.' });
    }
    const sql = getSql();
    const taken = await sql`select 1 from users where email = ${email} limit 1`;
    if (taken.length) return send(res, 409, { error: 'Gmail sudah dipakai akun lain.' });

    const hash = await bcrypt.hash(password, 10);
    const rows = await sql`
      insert into users (username, email, password_hash)
      values (${username}, ${email}, ${hash})
      on conflict do nothing
      returning id, username, email, coins, wins, equipped_skin`;
    if (rows.length === 0) {
      const again = await sql`select 1 from users where email = ${email} limit 1`;
      return send(res, 409, { error: again.length ? 'Gmail sudah dipakai akun lain.' : 'Username sudah dipakai.' });
    }
    return send(res, 200, { token: signUser(rows[0]), user: publicUser(rows[0], []) });
  } catch (err) {
    return fail(res, err);
  }
}

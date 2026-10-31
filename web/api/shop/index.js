import { getSql } from '../_lib/db.js';
import { getAuth, publicUser, send, fail } from '../_lib/auth.js';
import { SKINS } from '../../config/skins.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const auth = getAuth(req);
    if (!auth) return send(res, 401, { error: 'Belum login.' });
    const sql = getSql();
    const rows = await sql`
      select id, username, coins, wins, equipped_skin from users where id = ${auth.sub} limit 1`;
    if (rows.length === 0) return send(res, 401, { error: 'Akun tidak ditemukan.' });
    const owned = await sql`select skin_id from user_skins where user_id = ${auth.sub}`;
    return send(res, 200, {
      skins: SKINS,
      user: publicUser(rows[0], owned.map((s) => s.skin_id)),
    });
  } catch (err) {
    return fail(res, err);
  }
}

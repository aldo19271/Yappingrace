import { getSql } from '../_lib/db.js';
import { getAuth, signUser, publicUser, send, fail } from '../_lib/auth.js';
import { SKINS, DEFAULT_SKIN } from '../../config/skins.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const auth = getAuth(req);
    if (!auth) return send(res, 401, { error: 'Belum login.' });
    const skin = SKINS.find((s) => s.id === (req.body || {}).skinId);
    if (!skin) return send(res, 400, { error: 'Skin tidak ditemukan.' });

    const sql = getSql();
    const rows = await sql`
      update users set equipped_skin = ${skin.id}::text
      where id = ${auth.sub}
        and (${skin.id}::text = ${DEFAULT_SKIN}::text
             or exists (select 1 from user_skins where user_id = ${auth.sub} and skin_id = ${skin.id}::text))
      returning id, username, coins, wins, equipped_skin`;
    if (rows.length === 0) return send(res, 403, { error: 'Kamu belum memiliki skin ini.' });

    const owned = await sql`select skin_id from user_skins where user_id = ${auth.sub}`;
    return send(res, 200, {
      token: signUser(rows[0]),
      user: publicUser(rows[0], owned.map((s) => s.skin_id)),
    });
  } catch (err) {
    return fail(res, err);
  }
}

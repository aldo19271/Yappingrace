import { getSql } from '../_lib/db.js';
import { getAuth, publicUser, send, fail } from '../_lib/auth.js';
import { SKINS } from '../../config/skins.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const auth = getAuth(req);
    if (!auth) return send(res, 401, { error: 'Belum login.' });
    const skin = SKINS.find((s) => s.id === (req.body || {}).skinId);
    if (!skin || skin.price <= 0) return send(res, 400, { error: 'Skin tidak bisa dibeli.' });

    const sql = getSql();
    // Satu perintah atomik: potong koin dan catat kepemilikan hanya jika koin cukup dan belum punya.
    const bought = await sql`
      with paid as (
        update users set coins = coins - ${skin.price}
        where id = ${auth.sub}
          and coins >= ${skin.price}
          and not exists (select 1 from user_skins where user_id = ${auth.sub} and skin_id = ${skin.id}::text)
        returning id
      )
      insert into user_skins (user_id, skin_id)
      select id, ${skin.id}::text from paid
      returning skin_id`;

    const rows = await sql`
      select id, username, coins, wins, equipped_skin from users where id = ${auth.sub} limit 1`;
    const owned = await sql`select skin_id from user_skins where user_id = ${auth.sub}`;
    const user = publicUser(rows[0], owned.map((s) => s.skin_id));

    if (bought.length === 0) {
      const already = user.owned.includes(skin.id);
      return send(res, already ? 409 : 402, {
        error: already ? 'Skin ini sudah kamu miliki.' : 'Koin kamu belum cukup.',
        user,
      });
    }
    return send(res, 200, { user });
  } catch (err) {
    return fail(res, err);
  }
}

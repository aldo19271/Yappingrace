import { getSql } from './_lib/db.js';
import { normalizeSkin, send, fail } from './_lib/auth.js';

// Profil publik pemain (dipakai saat nama di leaderboard ditekan).
export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const name = String((req.query && req.query.name) || '');
    if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) return send(res, 400, { error: 'Nama tidak valid.' });
    const sql = getSql();
    const rows = await sql`
      select username, wins, total_coins_earned, equipped_skin
      from users where lower(username) = lower(${name}) limit 1`;
    if (rows.length === 0) return send(res, 404, { error: 'Pemain tidak ditemukan.' });
    const u = rows[0];
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({
      profile: { name: u.username, wins: u.wins, coins: u.total_coins_earned, skin: normalizeSkin(u.equipped_skin) },
    });
  } catch (err) {
    return fail(res, err);
  }
}

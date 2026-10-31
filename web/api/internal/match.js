import { timingSafeEqual } from 'node:crypto';
import { getSql } from '../_lib/db.js';
import { send, fail } from '../_lib/auth.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function secretOk(req) {
  const expected = process.env.GAME_SERVER_SECRET || '';
  const got = String(req.headers['x-game-secret'] || '');
  if (expected.length < 16 || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

// Dipanggil oleh server game (Cloudflare Worker) saat pertandingan selesai.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!secretOk(req)) return send(res, 401, { error: 'Tidak diizinkan.' });
  try {
    const b = req.body || {};
    const players = Array.isArray(b.players) ? b.players : [];
    if (
      typeof b.matchId !== 'string' ||
      b.matchId.length > 64 ||
      ![1, 2].includes(b.winnerTeam) ||
      players.length < 1 ||
      players.length > 8
    ) {
      return send(res, 400, { error: 'Data tidak valid.' });
    }
    const clean = [];
    for (const p of players) {
      if (
        !p ||
        typeof p.userId !== 'string' ||
        !UUID.test(p.userId) ||
        ![1, 2].includes(p.team) ||
        !Number.isInteger(p.words) ||
        p.words < 0 ||
        p.words > 10000 ||
        !Number.isInteger(p.coins) ||
        p.coins < 0 ||
        p.coins > 100
      ) {
        return send(res, 400, { error: 'Data pemain tidak valid.' });
      }
      clean.push({
        userId: p.userId,
        team: p.team,
        words: p.words,
        coins: p.coins,
        won: !!p.won,
        isMvp: !!p.isMvp,
      });
    }

    const sql = getSql();
    const inserted = await sql`
      insert into matches (id, room_name, winner_team, player_count)
      values (${b.matchId}, ${String(b.roomName || '').slice(0, 40)}, ${b.winnerTeam}, ${Number(b.playerCount) || clean.length})
      on conflict (id) do nothing
      returning id`;
    if (inserted.length === 0) return send(res, 200, { ok: true, duplicate: true });

    // Hanya akun yang masih ada di database
    const ids = clean.map((p) => p.userId);
    const existing = await sql`select id from users where id = any(${ids}::uuid[])`;
    const known = new Set(existing.map((r) => r.id));

    const queries = [];
    for (const p of clean) {
      if (!known.has(p.userId)) continue;
      queries.push(sql`
        insert into match_players (match_id, user_id, team, words_typed, is_mvp, won, coins_earned)
        values (${b.matchId}, ${p.userId}, ${p.team}, ${p.words}, ${p.isMvp}, ${p.won}, ${p.coins})
        on conflict do nothing`);
      queries.push(sql`
        update users
        set coins = coins + ${p.coins},
            total_coins_earned = total_coins_earned + ${p.coins},
            wins = wins + ${p.won ? 1 : 0}
        where id = ${p.userId}`);
    }
    if (queries.length) await sql.transaction(queries);
    return send(res, 200, { ok: true });
  } catch (err) {
    return fail(res, err);
  }
}

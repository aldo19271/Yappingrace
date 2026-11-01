import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getSql } from './_lib/db.js';
import { send, fail } from './_lib/auth.js';
import { normalizeEmail } from './_lib/email.js';
import { sendResetCode } from './_lib/mail.js';

const CODE_TTL_MIN = 10;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function hashCode(userId, code) {
  return crypto.createHash('sha256').update(`${process.env.JWT_SECRET}:${userId}:${code}`).digest('hex');
}

function sameHash(a, b) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/**
 * POST { action: 'send', email }                          -> kirim kode ke Gmail
 * POST { action: 'reset', email, code, username?, password? } -> cek kode lalu ganti username/password
 * Username / password yang dikosongkan tidak diubah.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const { action, email: rawEmail, code, username, password } = req.body || {};
    const email = normalizeEmail(rawEmail);
    if (!email) return send(res, 400, { error: 'Isi Gmail yang valid (contoh: nama@gmail.com).' });
    const sql = getSql();
    const users = await sql`select id from users where email = ${email} limit 1`;
    if (users.length === 0) return send(res, 404, { error: 'Gmail ini belum terdaftar.' });
    const userId = users[0].id;

    if (action === 'send') {
      const prev = await sql`
        select greatest(0, ceil(extract(epoch from (sent_at + make_interval(secs => ${RESEND_SECONDS}) - now()))))::int as wait
        from email_codes where user_id = ${userId}`;
      if (prev.length && prev[0].wait > 0) {
        return send(res, 429, { error: `Tunggu ${prev[0].wait} detik sebelum kirim ulang.`, wait: prev[0].wait });
      }
      const plain = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      await sql`
        insert into email_codes (user_id, code_hash, expires_at, attempts, sent_at)
        values (${userId}, ${hashCode(userId, plain)}, now() + make_interval(mins => ${CODE_TTL_MIN}), 0, now())
        on conflict (user_id) do update
          set code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, sent_at = now()`;
      try {
        await sendResetCode(email, plain);
      } catch (err) {
        console.error(err);
        await sql`delete from email_codes where user_id = ${userId}`;
        return send(res, 502, { error: 'Gagal mengirim email. Coba lagi sebentar.' });
      }
      return send(res, 200, { ok: true, wait: RESEND_SECONDS });
    }

    if (action === 'reset') {
      const newName = typeof username === 'string' && username.trim() ? username.trim() : null;
      const newPass = typeof password === 'string' && password ? password : null;
      if (newName && !/^[A-Za-z0-9_]{3,16}$/.test(newName)) {
        return send(res, 400, { error: 'Username 3-16 karakter: huruf, angka, atau underscore.' });
      }
      if (newPass && (newPass.length < 6 || newPass.length > 72)) {
        return send(res, 400, { error: 'Password minimal 6 karakter.' });
      }
      if (typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
        return send(res, 400, { error: 'Kode terdiri dari 6 angka.' });
      }

      const rows = await sql`
        select code_hash, attempts, expires_at > now() as live from email_codes where user_id = ${userId}`;
      const row = rows[0];
      if (!row || !row.live) return send(res, 400, { error: 'Kode kedaluwarsa. Kirim kode baru.' });
      if (row.attempts >= MAX_ATTEMPTS) {
        await sql`delete from email_codes where user_id = ${userId}`;
        return send(res, 429, { error: 'Terlalu banyak salah. Kirim kode baru.' });
      }
      if (!sameHash(row.code_hash, hashCode(userId, code.trim()))) {
        await sql`update email_codes set attempts = attempts + 1 where user_id = ${userId}`;
        return send(res, 400, { error: 'Kode salah.' });
      }

      if (newName || newPass) {
        const hash = newPass ? await bcrypt.hash(newPass, 10) : null;
        try {
          const upd = await sql`
            update users set username = coalesce(${newName}::text, username),
                             password_hash = coalesce(${hash}::text, password_hash)
            where id = ${userId} returning id`;
          if (upd.length === 0) return send(res, 404, { error: 'Akun tidak ditemukan.' });
        } catch (err) {
          if (err && err.code === '23505') return send(res, 409, { error: 'Username sudah dipakai.' });
          throw err;
        }
      }
      await sql`delete from email_codes where user_id = ${userId}`;
      return send(res, 200, { ok: true, usernameChanged: !!newName, passwordChanged: !!newPass });
    }

    return send(res, 400, { error: 'Permintaan tidak dikenal.' });
  } catch (err) {
    return fail(res, err);
  }
}

# worker

Server WebSocket game YappingRace (Cloudflare Workers + Durable Objects).

- `Lobby` (satu instance): identitas guest unik, daftar room, pembuatan room
- `Room` (satu per kode room): semua aturan game dihitung di sini (tim, damage, target, hasil)
- Kata dibuat oleh Gemini; jika gagal otomatis memakai daftar kata cadangan (`src/words.js`)

## Secrets (Cloudflare dashboard > Worker > Settings > Variables and Secrets, tipe Secret)

- `JWT_SECRET` : sama persis dengan di Vercel
- `GAME_SERVER_SECRET` : sama persis dengan di Vercel
- `GEMINI_API_KEY` : kunci dari Google AI Studio

## Variabel biasa (di `wrangler.toml`)

- `API_URL` : alamat web di Vercel, contoh `https://yappingrace.vercel.app`
- `GEMINI_MODEL` : nama model Gemini
- `ALLOWED_ORIGINS` : opsional, batasi origin yang boleh konek

Ubah variabel biasa lewat file `wrangler.toml` di GitHub, bukan di dashboard (dashboard akan tertimpa saat deploy ulang).

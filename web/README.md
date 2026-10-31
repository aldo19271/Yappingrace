# web

Frontend (Vite + React) dan API (folder `api/`, Vercel Functions) YappingRace.
Deploy ke Vercel dengan Root Directory `web`.

## Isi

- `src/` : halaman dan komponen (landing, menu, create/join room, shop, leaderboard, room, game)
- `api/` : register, login, me, shop (beli/pakai skin), leaderboard, dan `internal/match` (hanya dipanggil server game)
- `config/skins.js` : daftar skin dan harga. Ubah angka `price` di sini.
- `public/skins/` : taruh gambar skin sendiri di sini

## Environment Variables (Vercel)

Lihat `.env.example`. Wajib: `DATABASE_URL`, `JWT_SECRET`, `GAME_SERVER_SECRET`, `VITE_WS_URL`.

`VITE_WS_URL` dibaca saat build, jadi setelah mengubahnya lakukan Redeploy.

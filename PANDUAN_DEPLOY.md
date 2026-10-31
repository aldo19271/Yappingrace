# Panduan deploy (semua dari HP, gratis)

Urutannya penting karena Vercel dan Cloudflare saling butuh alamat satu sama lain.

## 0. Siapkan dua string rahasia

Buat dua string acak panjang (minimal 32 karakter, huruf dan angka), simpan di catatan HP:

- `JWT_SECRET`
- `GAME_SERVER_SECRET`

Nilainya harus sama persis di Vercel dan di Cloudflare. Jangan dimasukkan ke GitHub.

## 1. GitHub

1. Buat repo `yappingrace` (Private), jangan centang README/.gitignore.
2. Upload seluruh isi zip (folder `web`, `worker`, `db`, file `README.md`, `PANDUAN_DEPLOY.md`, `.gitignore`).
3. Commit ke `main`.

Jika HP tidak bisa upload folder sekaligus, upload per folder atau pakai github.dev (tekan titik di halaman repo di browser).

## 2. Neon (database)

1. neon.tech > New Project `yappingrace`, region Singapore.
2. SQL Editor > tempel isi `db/schema.sql` > Run. Pastikan ada 4 tabel.
3. Connect > pilih Pooled connection > salin `postgresql://...` (ini `DATABASE_URL`).

## 3. Gemini

1. aistudio.google.com/apikey > Create API key (gratis). Ini `GEMINI_API_KEY`.
2. Jika kata tidak terbuat dari Gemini, game tetap jalan memakai kata cadangan. Cek nama model yang masih aktif di AI Studio lalu ubah `GEMINI_MODEL` di `worker/wrangler.toml`.

## 4. Cloudflare Worker (server game)

1. dash.cloudflare.com > Workers & Pages > Create > Import a repository (Connect to Git) > pilih repo.
2. Isian build:
   - Project/Worker name: `yappingrace-ws` (harus sama dengan `name` di `worker/wrangler.toml`)
   - Root directory: `worker`
   - Build command: kosongkan
   - Deploy command: `npx wrangler deploy`
3. Deploy. Setelah selesai catat alamatnya: `https://yappingrace-ws.NAMA-AKUN.workers.dev`.
4. Worker > Settings > Variables and Secrets > tambahkan tipe **Secret**:
   - `JWT_SECRET`
   - `GAME_SERVER_SECRET`
   - `GEMINI_API_KEY`
5. Jika server game dan web sudah jalan tetapi room tidak terbuat, cek Worker > Logs.

## 5. Vercel (web + API)

1. vercel.com > Add New > Project > import repo `yappingrace`.
2. **Root Directory: `web`**. Framework Preset: Vite (terdeteksi otomatis).
3. Environment Variables:
   - `DATABASE_URL` = string dari Neon
   - `JWT_SECRET` = sama dengan di Cloudflare
   - `GAME_SERVER_SECRET` = sama dengan di Cloudflare
   - `VITE_WS_URL` = `wss://yappingrace-ws.NAMA-AKUN.workers.dev` (awalan `wss://`, bukan `https://`)
4. Deploy. Catat alamat web, contoh `https://yappingrace.vercel.app`.

## 6. Hubungkan balik

1. Di GitHub edit `worker/wrangler.toml`, isi `API_URL = "https://yappingrace.vercel.app"` (alamat Vercel kamu, tanpa garis miring di akhir), commit. Cloudflare otomatis deploy ulang.
2. Opsional: isi `ALLOWED_ORIGINS` dengan alamat web agar hanya webmu yang bisa konek.

## 7. Tes

1. Buka web, main sebagai guest di dua tab/HP: Create Room di satu, Join di yang lain, Mulai game.
2. Daftar akun, menangkan game, cek koin bertambah (butuh `API_URL` dan `GAME_SERVER_SECRET` yang benar).

## Mengatur harga skin

Edit `web/config/skins.js`, ubah angka `price`, commit. Vercel deploy ulang otomatis.
Skin gambar sendiri: upload ke `web/public/skins/`, lalu tambahkan baris dengan `image: '/skins/namafile.png'`.

## Catatan batas gratis

- Server Cloudflare tidak "tidur" seperti Render, tapi ada kuota harian gratis (Durable Objects). Cek halaman pricing Cloudflare untuk angka terbaru.
- Neon gratis tertidur saat sepi: login pertama bisa lambat beberapa detik.
- Kuota Gemini gratis terbatas; jika habis, kata cadangan dipakai otomatis.
- Login memakai bcrypt di Vercel Function (bukan di Worker) karena batas CPU Worker gratis kecil.

## Jika bermasalah

- Menu terus "Menyalakan server": `VITE_WS_URL` salah (harus `wss://...`), atau Worker belum deploy. Setelah mengubah `VITE_WS_URL`, Redeploy di Vercel.
- "Sesi tidak valid": `JWT_SECRET` di Vercel dan Cloudflare berbeda.
- Koin tidak bertambah: `API_URL` kosong atau `GAME_SERVER_SECRET` berbeda. Lihat Worker > Logs.
- Login error 500: `DATABASE_URL` salah atau `schema.sql` belum dijalankan.

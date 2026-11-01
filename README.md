<div align="center">

<img src="web/public/opoiki.png" alt="Logo AduYapping" width="140" />

# AduYapping

**Adu ngetik multiplayer, tim lawan tim.**

[![Main sekarang](https://img.shields.io/badge/MAIN%20SEKARANG-aduyapping.vercel.app-ff6a00?style=for-the-badge&labelColor=111111)](https://aduyapping.vercel.app)

![React](https://img.shields.io/badge/React-111111?style=flat-square&logo=react&logoColor=ff6a00)
![Vite](https://img.shields.io/badge/Vite-111111?style=flat-square&logo=vite&logoColor=ff6a00)
![Vercel](https://img.shields.io/badge/Vercel-111111?style=flat-square&logo=vercel&logoColor=ff6a00)
![Neon](https://img.shields.io/badge/Neon-111111?style=flat-square&logo=postgresql&logoColor=ff6a00)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-111111?style=flat-square&logo=cloudflare&logoColor=ff6a00)
![Gemini](https://img.shields.io/badge/Gemini-111111?style=flat-square&logo=googlegemini&logoColor=ff6a00)

</div>

---

Kamu dan temanmu ngetik kalimat secepat mungkin, tiap kalimat yang selesai menyerang musuh. Tim yang semua anggotanya masih berdiri di akhir, menang.

Mainnya langsung dari browser, di HP maupun laptop. Tidak perlu install apa pun.

## Tampilan

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/landing.png" alt="Halaman awal" width="220" /><br /><sub>Halaman awal</sub></td>
    <td align="center"><img src="docs/screenshots/menu.png" alt="Menu utama" width="220" /><br /><sub>Menu utama</sub></td>
    <td align="center"><img src="docs/screenshots/room.png" alt="Room" width="220" /><br /><sub>Room</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/game.png" alt="Pertandingan" width="220" /><br /><sub>Pertandingan</sub></td>
    <td align="center"><img src="docs/screenshots/shop.png" alt="Toko skin" width="220" /><br /><sub>Toko skin</sub></td>
    <td align="center"><img src="docs/screenshots/leaderboard.png" alt="Leaderboard" width="220" /><br /><sub>Leaderboard</sub></td>
  </tr>
</table>

## Cara main

1. Masuk dengan akun, atau pilih main sebagai guest.
2. Buat room baru, atau gabung ke room yang sudah ada lewat daftar room atau kode room.
3. Host mengatur room: jumlah pemain, nyawa, damage, dan password kalau mau room privat.
4. Pemain dibagi ke dua tim secara adil. Setelah hitung mundur selesai, ketik kalimat yang muncul.
5. Kalimat yang benar mengurangi nyawa lawan yang sedang kamu incar. Bisa ganti target kapan saja.
6. Tim yang masih punya pemain hidup menang. Pemain dengan kalimat terbanyak jadi MVP.

## Fitur

- Pertandingan tim lawan tim dengan banyak pemain dalam satu room.
- Kalimat dibuat oleh Gemini, jadi hampir tidak pernah sama.
- Room publik atau privat dengan password, lengkap dengan daftar room yang sedang buka.
- Akun dengan username, Gmail, dan password. Lupa password bisa dipulihkan lewat kode yang dikirim ke Gmail.
- Koin dari tiap pertandingan, bisa dipakai beli skin di toko.
- Leaderboard Top Win dan Top Koin. Ketuk nama pemain untuk melihat profilnya.
- Efek suara dan getar di HP, bisa dimatikan di Pengaturan.
- Tampilan oranye hitam yang minimal dan penuh animasi.

## Teknologi

| Bagian | Dipakai |
| --- | --- |
| Tampilan | React, Vite, Framer Motion, Lucide |
| API | Vercel Functions |
| Database | Neon (Postgres) |
| Server game realtime | Cloudflare Workers + Durable Objects (WebSocket) |
| Kalimat | Gemini API |
| Email kode pemulihan | Gmail SMTP |

Server game yang memegang semua aturan: kalimat, hitungan damage, dan hasil akhir. Browser hanya mengirim apa yang kamu ketik, jadi sulit dicurangi.

## Struktur repo

| Folder | Isi |
| --- | --- |
| `web/` | tampilan dan API (Vercel) |
| `worker/` | server WebSocket game (Cloudflare) |
| `db/` | skema dan migrasi database (Neon) |

## Pasang sendiri

Panduan lengkap untuk menjalankan versi sendiri ada di `PANDUAN_DEPLOY.md`.

Rahasia seperti kunci Gemini, URL database, dan secret tidak disimpan di repo. Semuanya diisi di dashboard Vercel dan Cloudflare.

## Pembuat

Dibuat oleh [aldo19271](https://github.com/aldo19271).

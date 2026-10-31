# YappingRace

Game adu ketik multiplayer (tim vs tim). Kata dibuat oleh Gemini, pemain saling serang dengan mengetik.

| Folder | Isi | Hosting |
| --- | --- | --- |
| `web/` | frontend + API | Vercel |
| `worker/` | server WebSocket game | Cloudflare Workers |
| `db/` | skema database | Neon |

Panduan deploy lengkap: `PANDUAN_DEPLOY.md`.

## Aturan

- Branch utama `main`. Push ke `main` memicu deploy otomatis.
- Rahasia (kunci Gemini, URL database, secret) tidak boleh masuk repo. Isi hanya di dashboard Vercel dan Cloudflare.

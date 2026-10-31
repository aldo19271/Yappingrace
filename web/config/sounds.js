// ============================================================
// SOUND EFFECT
// Taruh file mp3 di folder web/public/sounds/ dengan nama di bawah ini,
// lalu commit. Jika file belum ada, game tetap jalan tanpa suara.
//
//   click.mp3   : saat menekan tombol di UI (di luar game)
//   attack.mp3  : saat KAMU menyerang pemain lain (di dalam game)
//   win.mp3     : saat tim kamu menang
//   lose.mp3    : saat tim kamu kalah
//
// volume: 0 sampai 1. Ganti `src` jika memakai nama file lain.
// Pemain bisa mematikan suara lewat tombol speaker di Menu atau halaman About.
// ============================================================

export const SOUNDS = {
  click: { src: '/sounds/click.mp3', volume: 0.6 },
  attack: { src: '/sounds/attack.mp3', volume: 0.7 },
  win: { src: '/sounds/win.mp3', volume: 0.9 },
  lose: { src: '/sounds/lose.mp3', volume: 0.9 },
};

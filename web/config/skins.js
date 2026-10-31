// ============================================================
// DAFTAR SKIN DAN HARGANYA
// Ubah angka `price` di sini untuk mengatur harga (satuan: koin).
// Setelah diedit, commit ke GitHub dan Vercel otomatis deploy ulang.
//
// Menambah skin baru:
// 1. Taruh gambar (png/svg/webp) di folder web/public/skins/
// 2. Tambahkan baris baru di bawah dengan `image: '/skins/namafile.png'`
//    (id harus unik, huruf kecil dan underscore saja)
//
// Skin tanpa `image` digambar oleh kode (lihat `look`).
// Skin default (price 0) otomatis dimiliki semua akun yang login.
// ============================================================

export const DEFAULT_SKIN = 'stickman_hitam';

export const SKINS = [
  { id: 'stickman_hitam', name: 'Stickman Hitam', price: 0, look: 'stickman' },
  { id: 'stickman_penyihir', name: 'Stickman Penyihir', price: 60, look: 'penyihir' },
  { id: 'stickman_ksatria', name: 'Stickman Ksatria', price: 80, look: 'ksatria' },
  { id: 'stickman_ninja', name: 'Stickman Ninja', price: 100, look: 'ninja' },
  { id: 'robot_oranye', name: 'Robot Oranye', price: 150, look: 'robot' },
  { id: 'astronot', name: 'Astronot', price: 200, look: 'astronot' },
  // Contoh skin dengan gambar sendiri (hapus tanda // untuk mengaktifkan):
  // { id: 'skin_saya', name: 'Skin Saya', price: 120, image: '/skins/skin_saya.png' },
];

export function findSkin(id) {
  return SKINS.find((s) => s.id === id) || SKINS[0];
}

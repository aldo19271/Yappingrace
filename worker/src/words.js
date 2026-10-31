// Kata cadangan bahasa Indonesia, dipakai jika Gemini gagal atau kuotanya habis.
// Huruf kecil, tanpa tanda baca. Boleh ditambah kapan saja.
export const FALLBACK_WORDS = `
air api atas awan ayam bahu bakso bangun bantal barat batu bawah bedak belajar benar berani besar bintang biru buku bulan bunga burung cahaya cepat cerita cinta cuaca dapur datang daun dingin dompet dunia ekor emas gagah gambar garam gelas gunung gula hadiah halaman hangat hari hati hijau hujan hutan ikan indah ingat jalan jalur jambu jauh jeruk jendela jujur kabar kaca kain kakak kalung kamar kanan kapal karet kasur kayu kebun kecil kelapa kemarin kepala kertas kopi kucing kunci kursi laut lampu langit lapar laut layar lembut lemari liburan lidah listrik lompat luas macan madu makan malam mandi mangga manis mata matahari merah meja mimpi minum mobil motor mulut murah musim nada nasi nyanyi obat orang padi pagi pantai pasir payung pelan pensil perahu pergi pesan pintar pintu pisang pohon pulau pulang punggung putih rambut ramai rasa rawa rindu roda rumah rumput sabun sahabat sakit salju sambal sampai sapi sawah sayur sebelah sekolah semut senang sepatu sepeda siang singa sore sungai suara surat tahu tangan tanah tangga tarik tas teman tenang tepat terang tikus timur tinggi tidur topi tulis ular untuk upah usaha utara wajah waktu warna warung yakin zaman
`
  .split(/\s+/)
  .filter(Boolean);

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ambil n kata cadangan (diulang jika kurang). */
export function fallbackWords(n) {
  const out = [];
  while (out.length < n) out.push(...shuffle(FALLBACK_WORDS));
  return out.slice(0, n);
}

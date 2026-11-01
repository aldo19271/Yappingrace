/**
 * Ubah input Gmail ke bentuk baku, atau null jika bukan Gmail yang valid.
 * Gmail tidak membedakan huruf besar/kecil, mengabaikan titik, dan mengabaikan "+tag":
 * a.b+x@gmail.com dan ab@gmail.com adalah kotak surat yang sama, jadi disamakan
 * supaya satu Gmail tidak bisa dipakai di dua akun.
 */
export function normalizeEmail(input) {
  if (typeof input !== 'string') return null;
  const m = input.trim().toLowerCase().match(/^([a-z0-9._+-]{1,64})@(gmail\.com|googlemail\.com)$/);
  if (!m) return null;
  const local = m[1].split('+')[0].replace(/\./g, '');
  if (!/^[a-z0-9]{1,64}$/.test(local)) return null;
  return `${local}@gmail.com`;
}

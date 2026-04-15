// data.js

export const universityList = ["UIM", "KSU", "KAU", "IU", "PNU", "KFUPM", "KAUST", "QU", "KFU", "TAIBAHU"];

export const graduationYears = Array.from({length: 21}, (_, i) => (new Date().getFullYear() - i).toString());

export const statusKampusList = ["Belum Mendaftar", "Sedang Mendaftar", "Diterima", "Ditolak", "Cadangan"];

export const docFields = [
  { k: 'sertifikat_hafalan', l: 'Sertifikat Hafalan' },
  { k: 'tazkiyah_immit', l: 'Tazkiyah IMMIT' },
  { k: 'skkb_sma_lh', l: 'SKKB SMA LH' },
  { k: 'tazkiyah_hidayatullah', l: 'Tazkiyah Hidayatullah' }
];

export const berkasWajib = [
  { key: 'ijazah', label: 'Ijazah' }, { key: 'ijazah_tr', label: 'Ijazah Terjemah' },
  { key: 'transkip', label: 'Transkip Nilai' }, { key: 'transkip_tr', label: 'Transkip Nilai Terjemah' },
  { key: 'foto', label: 'Foto Latar Putih (4:6)' }, { key: 'paspor', label: 'Paspor' }
];

export const berkasPendukung = [
  { key: 'tazkiyah_1', label: 'Tazkiyah 1' }, { key: 'tazkiyah_2', label: 'Tazkiyah 2' },
  { key: 'skkb', label: 'SKKB' }, { key: 'skck', label: 'SKCK' },
  { key: 'skck_tr', label: 'SKCK Terjemah' }, { key: 'sks', label: 'SKS' },
  { key: 'sks_tr', label: 'SKS Terjemah' }, { key: 'cv', label: 'CV' },
  { key: 'toafl_toefl', label: 'TOAFL / TOEFL' }
];

export const berkasTambahan = [
  { key: 'piagam', label: 'Piagam Penghargaan' }
];

export const fileList = [...berkasWajib, ...berkasPendukung, ...berkasTambahan];

export const defaultInfoData = [
  { id: 1, step: 'Langkah 1', info: '<b>Siapkan Dokumen Eksternal</b><br>Pastikan Anda telah mengunduh dan mengisi format template dokumen resmi yang disediakan pada menu Dokumen.', link: '[https://drive.google.com/](https://drive.google.com/)', gambar: '' },
  { id: 2, step: 'Langkah 2', info: '<b>Lengkapi Biodata Anda</b><br>Isi seluruh informasi identitas dan riwayat pendidikan Anda dengan benar dan valid sesuai Paspor.', link: '', gambar: '' },
  { id: 3, step: 'Langkah 3', info: '<b>Finalisasi & Pengajuan</b><br>Periksa kembali kelengkapan seluruh berkas Anda, lalu klik tombol <i>Ajukan Verifikasi Sekarang</i> agar diproses oleh Tim Admin.', link: '', gambar: '' }
];

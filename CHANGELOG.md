# Changelog

Semua perubahan penting pada ATUR dicatat di berkas ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini memakai [Semantic Versioning](https://semver.org/lang/id/).

## [1.11.6] - 2026-07-01

### Diperbaiki
- Tombol "Kembali" pada layar "Lanjut dengan Email" kini punya gaya sendiri
  (`.auth-back`) — sebelumnya tampil sebagai tombol default browser yang
  kurang rapi. Ikon chevron & teks sejajar rapi, rata kiri, dengan efek
  hover/tekan.

## [1.11.5] - 2026-07-01

### Ditambahkan
- Fungsi `leaveHousehold()` — benar-benar keluar dari rumah tangga: menghapus
  keanggotaan diri sendiri di `household_members`, menghentikan channel
  real-time, dan mengosongkan `householdId`/`berduaConnected` di aplikasi.

### Diperbaiki
- Tombol "Putuskan koneksi" ATUR Berdua kini benar-benar memutus koneksi di
  database, bukan hanya mengubah tampilan (data tidak lagi tersinkron
  diam-diam setelah diputus).
- "Reset data & keluar" ikut keluar dari rumah tangga cloud sebelum menghapus
  data lokal.

## [1.11.0] - 2026-07-01

### Ditambahkan
- **Autentikasi Supabase (Tahap 1)** — login/daftar via Email dan Google, sesi
  tersimpan otomatis (`persistSession`, `autoRefreshToken`). Hanya memakai
  anon key di browser; RLS aktif di sisi Supabase.
- **Sinkronisasi & ATUR Berdua (Tahap 2)** — data keuangan tersimpan di cloud
  dan tersinkron real-time antar perangkat. Mode Berdua menyambungkan keuangan
  rumah tangga dengan pasangan secara privat.
- **Layar Welcome baru** — slider intro (4 slide) dan kartu login digabung jadi
  satu layar yang looping otomatis, lengkap dengan logo ATUR, sapaan
  "Selamat Datang!", dot indikator, dan tombol tamu "Coba gratis tanpa log in".
- **Mockup slide dari UI asli** — tiap slide intro menampilkan komponen UI ATUR
  yang sebenarnya (hero arus kas, unggah e-statement, donut kategori + proyeksi
  tahunan, dan kartu ATUR Berdua).
- **Opsi masuk sebagai tamu** — bisa mencoba aplikasi tanpa akun; data bisa
  ditautkan ke akun kapan saja nanti.

### Diubah
- Logo ATUR pada layar Welcome ditampilkan putih di atas latar gelap
  (`filter:brightness(0) invert(1)`), memakai aset logo transparan yang sudah
  dipangkas.
- Warna glow radial latar Welcome disamakan dengan hex aplikasi:
  biru `#2563EB` dan oranye `#F97316`.

## [1.11.4] - 2026-07-01

### Diperbaiki
- Kartu mockup di layar Welcome tidak lagi terpotong saat animasi floating —
  ditambah ruang atas pada viewport slide.
- Deskripsi fitur tiap slide dipersingkat agar muat rapi tanpa terpotong
  (menghapus pemotongan elipsis `-webkit-line-clamp`).
- Tombol "Coba gratis tanpa log in" dibuat rata tengah pada layout.

[1.11.0]: https://github.com/ameliarby/ATUR
[1.11.4]: https://github.com/ameliarby/ATUR
[1.11.5]: https://github.com/ameliarby/ATUR
[1.11.6]: https://github.com/ameliarby/ATUR

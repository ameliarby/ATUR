# Changelog

Semua perubahan penting pada ATUR dicatat di berkas ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini memakai [Semantic Versioning](https://semver.org/lang/id/).

## [1.11.12] - 2026-07-01

### Diperbaiki
- **Logo ATUR tidak lagi ketutup Dynamic Island / notch** di layar Welcome.
  Padding atas `.wel-head` kini `max(env(safe-area-inset-top), 44px)` + jarak
  fluid kecil — mengambil nilai terbesar antara safe-area fisik iPhone dan
  minimum 44px. Aman di iPhone Dynamic Island (~59px), notch lama (~47px),
  iPhone tanpa island (fallback 44px), dan tetap tidak berlebihan pada mockup
  desktop 390×844 (yang notch-nya berbatas ~41px).

## [1.11.11] - 2026-07-01

### Diubah
- **Layout opening (Welcome) kini responsif & seimbang di semua iPhone.**
  - Padding atas `.wel-head` memakai `env(safe-area-inset-top)` + `clamp()`
    sehingga menghormati notch/Dynamic Island dan tinggi atas-bawah seimbang.
  - Logo, "Selamat Datang!", judul, dan keterangan slide memakai ukuran
    `clamp()` berbasis `vh` — ikut mengecil di layar pendek, membesar di layar
    tinggi.
  - Mockup UI (`.intro-ui`) tidak lagi berukuran tetap 190×224 px; kini
    `clamp()` + `aspect-ratio` + `max-height:100%` supaya menyesuaikan tinggi
    layar dan **tidak terpotong** di iPhone kecil.
  - Slide di-`justify-content:center` dengan `gap` fluid agar mockup + caption
    tampil sebagai satu grup yang seimbang.
- **Media query layar pendek** (`max-height:720px` & `640px`) merapatkan
  caption, keterangan, dan mockup untuk iPhone SE / perangkat pendek.

## [1.11.10] - 2026-07-01

### Diubah
- **Jam (status bar) dihapus** dari layar Welcome (slide opening) dan halaman
  isi nama (onboarding). Jam pada Home aplikasi tetap ada.
- **Konten Welcome digeser ke atas** — padding atas `.wel-head` dikurangi
  (52px → 44px) sehingga logo ATUR, "Selamat Datang!", dan mockup UI naik
  sedikit agar lebih seimbang.
- **Mockup UI tidak lagi terpotong di HP** — ruang vertikal yang dibebaskan
  setelah jam dihapus mengalir ke area slide (`.wel-view`, flex:1), memberi
  mockup lebih banyak ruang di layar kecil.

## [1.11.9] - 2026-07-01

### Diperbaiki
- **Login via Email dijamin jalan end-to-end** — routing setelah sesi cloud
  terdeteksi dipindah ke fungsi `routeAfterAuth()` yang dipakai bersama oleh
  `boot()` dan listener `onAuthStateChange`. Kini bila token magic-link baru
  selesai ditukar SETELAH layar Welcome tampil, aplikasi langsung berpindah ke
  layar isi nama → Home (menutup kemungkinan race sesi terlewat saat `boot()`).
- Token magic-link / kode OAuth dibersihkan lebih lengkap dari URL
  (`access_token`, `type=`, `code=`) agar tidak nyangkut saat refresh.
- `signOut()` mereset flag `authRouted` sehingga login ulang di sesi halaman
  yang sama tetap dirutekan dengan benar.

## [1.11.8] - 2026-07-01

### Diubah
- **Tombol "Coba gratis tanpa log in" tanpa frame** — kini tampil sebagai teks
  polos (tanpa border, tanpa kotak, tanpa garis bawah), hanya berubah warna
  saat hover/tekan.
- **Putus koneksi dari halaman "Hubungkan via WhatsApp"** kini mengembalikan
  Home ke mode **ATUR Sendiri** (bukan bertahan di layar Hubungkan). Mode,
  greeting, dan tag Home ikut disegarkan.

### Diperbaiki
- **Alur login Google end-to-end** — login Google → pilih akun Gmail →
  verifikasi → isi/konfirmasi nama (prefill dari akun Google) → baru masuk
  Home. `leaveHousehold()` tidak lagi memaksa mode Sendiri; penentuan mode
  diserahkan ke pemanggil.
- **Home mode Berdua selalu punya kartu "Hubungkan ke pasangan"** — saat belum
  terhubung, Home Berdua menampilkan kartu ajakan menautkan pasangan sehingga
  layar tidak pernah kosong.

## [1.11.7] - 2026-07-01

### Diubah
- **Opening default kini layar Welcome** — saat aplikasi dibuka dan belum
  login, pengguna diarahkan ke layar Welcome (login + slide intro), bukan
  langsung ke Home. Tamu yang sudah pernah menyelesaikan pengisian nama tetap
  langsung masuk Home.
- **Isi nama dulu setelah login** — setelah login Google/Email berhasil dan
  terverifikasi, pengguna wajib mengisi/mengonfirmasi nama di layar onboarding
  sebelum masuk Home. Nama dari akun Google dipakai sebagai saran awal
  (prefill), bukan langsung dianggap final.

### Diperbaiki
- **"Keluar" / "Reset data" kembali ke opening** — memilih keluar atau reset
  dari dalam ATUR kini membawa pengguna ke layar Welcome (opening), sekaligus
  keluar dari sesi cloud (`signOut`) — sebelumnya kembali ke layar Home/telepon.
- **Frame tautkan kembali tetap ada setelah putus koneksi** — pada fitur ATUR
  Berdua, setelah memutus koneksi dengan pasangan, layar Hubungkan langsung
  render ulang ke mode "belum terhubung" sehingga frame untuk menautkan
  kembali langsung tersedia.

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
[1.11.7]: https://github.com/ameliarby/ATUR
[1.11.8]: https://github.com/ameliarby/ATUR
[1.11.9]: https://github.com/ameliarby/ATUR
[1.11.10]: https://github.com/ameliarby/ATUR
[1.11.11]: https://github.com/ameliarby/ATUR
[1.11.12]: https://github.com/ameliarby/ATUR

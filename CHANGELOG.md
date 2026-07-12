# Changelog

Semua perubahan penting pada ATUR dicatat di berkas ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini memakai [Semantic Versioning](https://semver.org/lang/id/).

## [1.12.1] - 2026-07-12

### Ditambahkan
- **Dropdown "Tujuan aset" di Kekayaan.** Setiap aset kini bisa ditandai
  tujuannya: **Dana Darurat** (bawaan) atau **Kustom** — nama tujuan yang
  diketik sendiri oleh pengguna (mis. "Dana Pendidikan", "Dana Pensiun").
  Tersedia di form **Tambah Aset** dan **Edit Aset** (pilihan "+ Kustom baru…"
  memunculkan input teks). Nama tujuan kustom **diingat lintas sesi**
  (`localStorage: atur_asset_purposes`) sehingga bisa dipakai ulang di aset lain.
- **Sinkron ke seluruh data.** Tujuan tersimpan di objek aset dan tampil sebagai
  **badge** di baris Detail Aset (badge hijau khusus untuk **Dana Darurat**).
- **Dana Darurat masuk ke konteks Tanya AI (skor kesehatan).** `taBuildContext`
  kini menyertakan **total kekayaan, dana darurat, berapa bulan pengeluaran yang
  ter-cover dana darurat, dan rincian kekayaan per tujuan** — jawaban AI jadi
  lebih presisi soal ketahanan keuangan.
- **Export Excel ikut sinkron.** File ekspor kini punya **sheet kedua
  "Kekayaan"** berisi kolom **Jenis · Nilai (IDR) · Sumber/Catatan · Tujuan ·
  Bunga %/th**, plus baris **Total Kekayaan** dan **Dana Darurat**.

## [1.12.0] - 2026-07-12

### Ditambahkan
- **Chat bar "Tanya AI" di bawah toggle Sendiri/Berdua.** Pengganti tombol pil
  "Tanya AI" di header (pil lama dihapus). Berbentuk bar penuh dengan chip
  **Tanya AI** + ikon kilau di kiri, **placeholder yang berputar dinamis**
  (fade tiap ±3,5 detik) melalui empat teks pendek yang dijamin tidak terpotong
  menjadi "…": **Insight keuangan · Tips biar AI presisi · Aku boros nggak ·
  Input e-statement**. Rotasi **berhenti saat hover** dan menghormati
  `prefers-reduced-motion` (teks statik bila animasi dimatikan). Mengetuk bar
  **membuka pop-up chat Tanya AI** sekaligus **prefill** pertanyaan sesuai teks
  yang sedang tampil. Warna mengikuti **brand mode** (biru Sendiri / oranye
  Berdua) via `--accent`.

### Diubah
- **Tampilan DESKTOP kini kaya-informasi (multi-kolom), bukan sekadar bingkai
  telepon yang diperbesar.** Pada layar **≥1024px**, kanvas melebar (maks
  1180px) dan `.scroll` menjadi **CSS Grid 3 kolom** (rail kiri: Proyeksi &
  Kekayaan · kolom utama: saldo/hero, Kategori, Ledger · rail kanan: Anggaran,
  Tujuan, tautan pasangan). Header membentang penuh dengan **toggle + chat bar
  sejajar**. Pada **1024–1279px** otomatis turun ke **2 kolom**; di **≥1280px**
  penuh 3 kolom. Di **HP (≤600px)** tampilan tetap persis seperti sekarang
  (mobile web full-bleed). **Markup identik untuk semua ukuran** — hanya tata
  letak yang berubah lewat CSS, sehingga **semua fitur ter-mirror** dan sinkron
  antara desktop & HP tanpa menggandakan logic. Pop-up/overlay (Tanya AI, layar
  detail, sheet export) di desktop dibatasi lebarnya & dipusatkan agar tidak
  melar memenuhi kanvas.

## [1.11.34] - 2026-07-12

### Ditambahkan
- **Tanya AI kini berbasis model (LLM), bukan sekadar aturan.** Chat memanggil
  endpoint serverless baru **`/api/tanya-ai`** (OpenAI, key rahasia di server —
  tidak pernah dikirim ke browser). Setiap pertanyaan dikirim bersama
  **ringkasan konteks keuangan** yang dihitung di sisi browser (mode aktif,
  daftar kategori, jumlah transaksi, total masuk/keluar, savings rate, 3
  kategori terbesar) sehingga jawaban spesifik ke data pengguna. Bila server
  belum dikonfigurasi (`OPENAI_API_KEY` kosong) atau gagal, chat otomatis
  **fallback** ke basis pengetahuan lokal — jadi tetap berfungsi offline/statis.
- **Pengetahuan produk Tanya AI diperkaya.** Prompt sistem + basis lokal kini
  menjelaskan detail:
  - **Kegunaan Anggaran (pagu)** — batas pengeluaran per kategori, fungsi alert,
    dan cara menambah pagu (termasuk penanggung jawab di mode Berdua).
  - **Tips agar analisa AI lebih presisi** — mis. menulis kata **"meal"/"makan"**
    di kolom Catatan agar transaksi terbaca 100% sebagai kategori Makanan; kata
    kunci lain seperti "grab/gojek" → Transport, "pln/listrik" → Utilities,
    "apotek/obat" → Medical, "netflix/langganan" → Subscription.
  - Cara mengambil e-Statement (OVO/GoPay/DANA/BCA/Mandiri/Jago) dan cara
    export ke Excel.
- **Tombol "Tanya AI" di header beranda.** Pil putih dengan border gradient
  animasi + ikon lampu (bohlam) dan label **Tanya AI**. Ketuk untuk membuka
  layar chat asisten (`scrTanyaAtur`) dengan chip saran pertanyaan.
- **Ikon Export ke Excel di header.** Ikon unduh (hanya ikon) di samping avatar
  membuka **bottom-sheet Export**. Dari pop-up ini user bisa:
  - memilih **rekap** — **Atur Sendiri** atau **Atur Berdua** (default mengikuti
    mode aktif);
  - memilih **periode** — **Bulanan** (bulan + tahun) atau **Per tanggal**
    (rentang tanggal);
  - melihat **pratinjau nama berkas** + jumlah transaksi terpilih;
  - menekan **Unduh Excel** untuk mengunduh workbook (SpreadsheetML) berisi
    rekap transaksi periode terpilih (Tanggal, Waktu, Sumber, Keterangan,
    Kategori, Sub, Arah, Jumlah + Total Masuk/Keluar/Selisih). Unduhan 100% di
    sisi klien.

### Diubah
- **Tampilan desktop kini responsif & adaptif.** Saat dibuka di browser desktop,
  bingkai aplikasi menyesuaikan **tinggi viewport** (dibatasi ~760–920px)
  sehingga seluruh layar terlihat tanpa terpotong di laptop pendek; lebar
  bingkai memakai `clamp()` (≈380–460px) dan latar halaman diberi gradient
  lembut. Di HP (≤600px) app tetap full-bleed seperti web-app native. Satu build
  responsif untuk HP maupun desktop.

## [1.11.33] - 2026-07-02

### Diperbaiki
- **Bug: pagu Berdua tidak punya tombol "+ Tambah" & tidak default kosong.**
  Sebelumnya layar **Anggaran & Alert** mode Berdua memakai katalog tetap 7
  kategori yang selalu muncul (dengan pagu 0), sementara kartu **Anggaran Bulan
  Ini** di beranda hanya menampilkan kategori yang punya pagu — sehingga daftar
  di dua layar terlihat tidak sinkron dan user tak bisa menambah pagu baru.

### Diubah
- **Pagu rumah tangga (Berdua) kini dikelola user, sama seperti mode Sendiri.**
  Daftar pagu **default kosong**; user/pasangan menambah lewat tombol
  **+ Tambah** → memilih kategori rumah tangga (Hunian, Tagihan, Belanja,
  Keluarga, Anak, Transport, Dana Darurat), mengisi pagu bulanan, dan menentukan
  penanggung jawab (Kamu / Pasangan / Tidak ada) sekaligus. Tiap kartu bisa
  diubah pagunya, diganti penanggung jawabnya, atau dihapus.
- **Kartu beranda "Anggaran Bulan Ini" kini mirror persis dengan layar pagu.**
  Karena kedua layar memakai daftar pagu aktif yang sama, kategori yang muncul
  selalu identik. Lencana inisial penanggung jawab tetap tampil (v1.11.32).
- **Penyimpanan pagu Berdua digabung** ke `atur_hh_budget_caps` dengan format
  `{key:{cap,pic}}` (kompatibel mundur dengan format lama + `atur_pic`).

## [1.11.32] - 2026-07-02

### Ditambahkan
- **Penanggung jawab (PIC) opsional pada pagu per kategori — mode Berdua.**
  Di layar **Anggaran & Alert** (mode Berdua), tiap kartu pagu kategori kini
  punya pemilih siapa yang bertanggung jawab: **Kamu**, **Pasangan**, atau
  **Tidak ada** (default). Pilihan disimpan lokal di perangkat
  (`localStorage.atur_pic`) dan belum disinkronkan ke cloud.
- **Penanda inisial PIC di kartu "Anggaran Bulan Ini" (beranda).**
  Kategori yang punya penanggung jawab menampilkan lencana inisial nama
  (warna sesuai orangnya) di sebelah nama kategori. Bila PIC "Tidak ada",
  tidak ada lencana yang muncul.

## [1.11.31] - 2026-07-02

### Diubah
- **Posisi toast "Tautan tersalin" kini di dekat elemen yang diklik.**
  Sebelumnya (v1.11.30) toast selalu melayang di bagian bawah layar, sehingga
  jauh dari titik aksi dan kurang disadari user. Kini `showToast()` menerima
  opsi `anchor` (elemen yang diketuk); toast diposisikan **tepat di atas** kartu
  "Ajak pasangan gabung" atau tombol "Salin tautan undangan" (otomatis pindah
  ke bawah anchor bila mepet tepi atas, dan dijaga tetap di dalam viewport).
  Diterapkan di semua titik salin — kartu ajak-pasangan di beranda (guest &
  setelah login), layar **Undang Pasangan**, dan **Hubungkan via WhatsApp**.
  Tanpa `anchor`, toast tetap memakai fallback melayang di bawah layar.

## [1.11.30] - 2026-07-02

### Ditambahkan
- **Notifikasi "Tautan tersalin" saat membagikan undangan pasangan.**
  Di bagian **Ajak pasangan gabung**, ketika tautan undangan disalin ke
  clipboard kini muncul **toast** ringan (muncul dari bawah, hilang otomatis
  ~2,2 detik) bertuliskan "Tautan undangan tersalin" — supaya user langsung
  sadar salinan berhasil, tidak hanya perubahan label tombol yang mudah
  terlewat. Berlaku di **semua titik salin**: kartu ajak-pasangan di beranda
  (mode guest maupun setelah login) serta layar **Undang Pasangan**
  (`scrInvite`, tombol "Salin tautan undangan") dan **Hubungkan via WhatsApp**
  (`scrConnectWA`, tombol "Salin tautan undangan") yang dipakai saat sudah login.
  Ditambahkan helper `showToast()` generik yang dapat dipakai ulang untuk
  feedback singkat lain.

## [1.11.29] - 2026-07-02

### Diubah
- **Layar "Pengeluaran per Kategori" mode Berdua ditata ulang.**
  Urutan bagian kini: **Total Pengeluaran Rumah → Ringkasan per orang → Per
  Kategori**. Kartu **"Pengeluaran per orang"** disederhanakan menjadi **dua
  total nominal saja** (kamu + pasangan) — tab dan daftar transaksi per orang
  dihapus, karena rincian transaksi sudah tersedia di tiap kartu kategori. Daftar
  kategori kini menampilkan **semua kartu** (tanpa batas 3 kartu). Tiap kartu
  kategori tetap menampilkan komposisi user & pasangan (bar + legenda).

### Ditambahkan
- **Chips filter "Semua / kamu / pasangan" di rincian kategori (khusus Berdua).**
  Saat mengetuk **Rincian** pada kartu kategori, muncul chips penyaring
  berdasarkan **penanggung jawab transaksi** (`txnPic`). Chips hanya tampil di
  mode Berdua; di mode Sendiri tidak ada penyaring. Filter **di-reset setiap
  kali layar rincian dibuka**. Jika tidak ada transaksi untuk penyaring terpilih,
  ditampilkan pesan kosong.

## [1.11.28] - 2026-07-02

### Diperbaiki
- **Sumber / Bank tidak muncul di rincian "Pengeluaran per Kategori" (kedua mode).**
  Pada layar rincian transaksi per kategori, tiap kartu hanya menampilkan nama,
  tanggal, dan nominal — informasi **sumber/bank** hilang. Penyebabnya:
  `txnsForDonutCat()` memetakan tiap transaksi ke tuple 3-elemen
  `[keterangan, tanggal, nominal]` sehingga `bank`/`source` terbuang, dan
  `scrKategori()` hanya merender ketiga elemen itu. Kini tuple membawa elemen
  ke-4 `bank || source`, lalu ditampilkan di samping tanggal — bank e-statement
  maupun sumber input manual keluar di kartu. Baris rincian per orang di mode
  Berdua (`scrKategoriBerdua`) juga kini menampilkan nama bank/sumber. Tuple demo
  lama (3-elemen) tetap aman (elemen ke-4 kosong → tanpa pemisah).
- **Nominal Berdua membengkak ×1.000.000 di "Pengeluaran per Kategori".**
  Di mode Berdua, pengeluaran manual `Rp 200.000` tampil menjadi
  `Rp 200.000.000.000` pada layar pengeluaran per kategori. Penyebabnya:
  `scrKategoriBerdua()` menurunkan total per kategori dalam **rupiah penuh**
  (dari `txnIDR()`), tetapi memformatnya dengan `jt()` yang mengharapkan angka
  dalam **juta** (mengalikan `×1e6`). Kini nilai rupiah penuh diformat dengan
  `jtfmt()` (mis. `Rp ${jtfmt(total)}`) pada total rumah, ringkasan per orang,
  dan tiap kartu kategori (5 titik). Layar **Anggaran & Alert** tidak diubah —
  di sana `jt()` memang menerima angka dalam juta (benar). Data cloud & sync
  tidak berubah; ini murni perbaikan tampilan.

## [1.11.27] - 2026-07-02

### Diperbaiki
- **Bug nominal Berdua terpotong saat sync (mis. `200.000` terbaca `200`).**
  Fungsi `_numAmt()` (dipakai `txnToCloud` untuk mengubah `amt` lokal → angka
  cloud) sebelumnya memakai `Number()` atas string locale ID yang masih
  mengandung **titik pemisah ribuan** — sehingga `"200.000"` ditafsirkan
  sebagai desimal `200`. Kini `_numAmt()` membuang **semua non-digit** (konsisten
  dengan `manualParse`), karena `amt` selalu bilangan bulat rupiah tanpa desimal:
  `"200.000"` → `200000`, `"1.250.000"` → `1250000`. Arah sebaliknya
  (`cloudToTxn`: angka cloud → `toLocaleString('id-ID')`) sudah benar & tidak
  berubah. Transaksi yang terlanjur salah perlu diedit/dicatat ulang.

## [1.11.26] - 2026-07-02

### Ditambahkan
- **Sinkronisasi data ATUR Berdua antar kedua akun pasangan.** Sebelumnya
  transaksi mode Berdua (`householdTxns`) hanya tersimpan di `localStorage`
  masing-masing perangkat sehingga data tidak pernah bertemu — setelah pasangan
  bergabung pun catatan tetap terpisah. Kini di mode **Berdua** (login cloud +
  sudah punya household), transaksi merupakan **gabungan & tersinkron** dari
  kedua akun lewat tabel `transactions` Supabase:
  - **Tambah / edit / hapus** transaksi Berdua langsung didorong ke backend
    (`pushTxnCloud` / `deleteTxnCloud` / `deleteTxnsCloud`).
  - Perubahan dari pasangan diterima **real-time** (listener `transactions`)
    lalu ditarik ulang (`pullHouseholdTxns`) & tampilan Beranda + Catatan Arus
    Kas ikut disegarkan otomatis (`refreshBerduaViews`).
  - **Sinkronisasi awal** (`syncBerduaInitial`) saat pertama masuk Berdua pada
    sebuah sesi: transaksi Berdua lokal yang belum ada di cloud dinaikkan dulu
    (agar data lama/offline tak hilang), baru data gabungan ditarik.
  - Impor e-statement di mode Berdua kini juga ikut terdorong ke cloud.
  - Titik masuk sync dipasang di `setMode('b')`, `enterBerduaAfterJoin()`, dan
    jalur pengundang di `routeAfterAuth()`.

### Diperbaiki
- **Kebocoran data mode Sendiri dinonaktifkan.** `migrateLocalToCloud()`
  sebelumnya mendorong `atur_manual_txns` (data **Sendiri**) ke tabel household
  bersama — melanggar privasi karena pasangan bisa melihatnya. Fungsi ini kini
  **no-op**: hanya data mode **Berdua** yang boleh masuk cloud.

### Dipertahankan
- **ATUR Sendiri tetap PRIVAT per akun** — `manualTxns` tidak pernah
  di-push/pull ke/dari cloud; sumbernya email masing-masing.
- Perilaku undangan (cloud/guest), status **"Menunggu…"** (cloud saja),
  dan fallback salin tautan tidak berubah.

## [1.11.25] - 2026-07-02

### Diubah
- **Mode guest: ketuk "Ajak pasangan gabung" kini menampilkan notifikasi yang
  meminta login Google dulu.** Sebelumnya (v1.11.24) jalur guest langsung
  menyalin tautan lokal ke clipboard. Kini saat guest mengetuk kartu
  ajak-pasangan, muncul dialog *"Masuk dulu, yuk"* yang menjelaskan bahwa untuk
  mengundang pasangan & menyinkronkan data berdua perlu **masuk dengan Google**:
  - **"Masuk dengan Google"** → memanggil `signInGoogle()` (redirect OAuth) dan
    menghentikan alur; setelah kembali sebagai cloud, user mengulang aksi undang.
  - **"Nanti saja"** → tetap menyalin **tautan lokal** ke clipboard sebagai
    fallback (tanpa buka WhatsApp, tanpa status "Menunggu…"), agar guest tidak
    terblokir.

### Dipertahankan
- Perilaku mode **cloud** tidak berubah: `createInvite()` → salin tautan
  `?join=<code>` ke clipboard + feedback "Tautan tersalin",
  `syncBerduaRealtime()` terpasang, `APP.inviteSent=true`.
- Status **"Menunggu…"** tetap hanya untuk mode cloud (aturan v1.11.22).
- Fallback salin manual (field tap-to-copy) bila Clipboard API gagal (v1.11.24).

## [1.11.24] - 2026-07-02

### Diubah
- **"Ajak pasangan gabung" kini MENYALIN tautan undangan ke clipboard —
  tidak lagi membuka WhatsApp.** Sebelumnya, saat user login (cloud) menekan
  kartu ajak-pasangan, aplikasi memanggil `window.open('https://wa.me/...')`
  sehingga user keluar dari aplikasi dan harus membuka ulang tautan ATUR.
  Kini pada kartu ATUR Berdua kondisi *belum terhubung*, sekali ketuk:
  - **Cloud** → membuat kode undangan **di backend** (`createInvite`, kode
    tidak ditampilkan), menyusun tautan `?join=<code>`, lalu menyalinnya ke
    clipboard via `navigator.clipboard.writeText()` dan menampilkan feedback
    **"Tautan tersalin"** (ikon centang) **tanpa keluar aplikasi**.
  - **Guest** → menyalin tautan lokal ke clipboard + info singkat *"kamu belum
    login, tautan ini lokal"* (tetap tanpa membuka WhatsApp).
- **Ikon WhatsApp dihapus dari kartu ajak-pasangan** (`.duo-ask-wa` / `I.wa`).
  Kartu kini cukup menampilkan **ikon link** yang bisa diketuk untuk menyalin.

### Ditambahkan
- **Fallback salin manual bila Clipboard API gagal** (mis. iOS Safari dalam
  konteks tertentu). `copyInviteLink()` mencoba `navigator.clipboard.writeText`,
  lalu jatuh ke `execCommand('copy')`; bila keduanya gagal, kartu menampilkan
  **field tautan yang bisa di-select/tap-to-copy manual** (via
  `showInviteFeedback()`), bukan gagal diam-diam.

### Dipertahankan
- Status realtime tetap berjalan: setelah `createInvite()` di jalur cloud,
  `syncBerduaRealtime()` tetap dipasang dan `APP.inviteSent=true` diset,
  sehingga kartu berubah otomatis **"Menunggu…" → "Terhubung"** saat pasangan
  bergabung.
- Aturan v1.11.22 dipertahankan: status **"Menunggu…"** hanya untuk mode cloud.

## [1.11.23] - 2026-07-01

### Diperbaiki
- **Notifikasi "Gagal menyiapkan undangan" kini menampilkan penyebab asli**
  (diagnostik). Sebelumnya pesan generik menyembunyikan sumber masalah saat
  user login (mode cloud) menekan "Ajak pasangan gabung". Kini `createInvite()`
  dan `ensureHousehold()` melempar pesan spesifik per-tahap (sesi tidak terbaca,
  RLS tabel `households`/`household_members`, atau `insert invites` ditolak),
  dan `sendInviteWA()` menampilkan detail tersebut di dialog + `console.warn`.
  `ensureHousehold()` kini mengembalikan error insert (bukan diam-diam `null`)
  sehingga kegagalan RLS/tabel tidak lagi tersamar; pemanggil `migrateLocalToCloud()`
  dibungkus try/catch agar tidak memicu unhandled rejection.

## [1.11.22] - 2026-07-01

### Diperbaiki
- **Status "Menunggu pasangan menerima undangan…" tidak lagi muncul di mode
  tamu (guest).** Sebelumnya, saat guest menekan "Ajak pasangan gabung", muncul
  notifikasi *belum tersinkron* lalu kartu menampilkan status menunggu — padahal
  tautan guest bersifat lokal dan tidak ada undangan yang benar-benar dikirim ke
  backend. Kini status menunggu **hanya muncul untuk user yang login (cloud)**.
  Pada `sendInviteWA()`, `APP.inviteSent=true` hanya diset di cabang cloud;
  cabang guest menyetel `APP.inviteSent=false` sehingga setelah menutup
  notifikasi, tampilan **kembali ke kartu ajak-pasangan biasa tanpa status
  menunggu**. Penjaga tampilan diperketat menjadi
  `APP.authMode==='cloud' && !!APP.inviteSent`.

## [1.11.21] - 2026-07-01

### Diubah
- **Ajak pasangan kini 1 ketuk dari home — tanpa landing "Hubungkan via
  WhatsApp".** Pada kartu ATUR Berdua kondisi *belum terhubung*, tombol lama
  "Hubungkan via WhatsApp" (yang membuka halaman terpisah) diganti kartu ringkas
  berisi **ikon link yang bisa diketuk** + ikon WhatsApp. Sekali ketuk langsung
  memanggil `sendInviteWA()`: mode cloud membuat kode undangan **di backend**
  (`createInvite`, kode tidak ditampilkan) lalu membuka WhatsApp dengan pesan
  siap-kirim; guest memakai tautan lokal + info agar login dulu untuk sinkron.
- Setelah undangan dikirim, kartu menampilkan status **"Menunggu pasangan
  menerima undangan…"** (flag `APP.inviteSent`), dan `syncBerduaRealtime()`
  langsung dipasang untuk pengundang sehingga status berubah otomatis menjadi
  **"Terhubung"** saat pasangan bergabung. Flag di-reset saat terhubung,
  keluar household (`leaveHousehold`), atau reset data Berdua.
- Halaman `scrConnectWA` kini hanya dipakai untuk **mengelola** koneksi yang
  sudah ada (dari kartu "Terhubung"), bukan sebagai gerbang untuk mengundang.

## [1.11.20] - 2026-07-01

### Ditambahkan
- **"Reset Data" dan "Keluar (Log out)" kini tombol terpisah** di Profil &
  Pengaturan (sebelumnya digabung sebagai satu aksi "Reset Data & Keluar").
  - **Keluar (Log out)** — hanya mengakhiri sesi (`signOut`). **Data cloud
    TETAP tersimpan**; login kembali dengan akun yang sama memulihkan seluruh
    data. Data lokal di perangkat tidak dihapus. Tombol **selalu tampil** (baik
    user login/cloud maupun tamu/guest); untuk tamu, keterangannya "Kembali ke
    layar awal" dan data lokal di perangkat tetap aman.
  - **Reset Data** — membuka pilihan cakupan: **Reset data Sendiri** atau
    **Reset data Berdua**. `resetSendiri()` menghapus transaksi, anggaran, & aset
    mode Sendiri saja; `resetBerdua()` menghapus transaksi, anggaran, pembagian
    tugas, & aset mode Berdua saja (dan memutus koneksi household bila
    tersambung). Masing-masing tidak memengaruhi data mode lain.
- **Kartu undangan sisi PENGUNDANG kini tersegar real-time.** Setelah pengundang
  membuat & mengirim undangan (salin tautan / kirim via WhatsApp) dalam mode
  cloud, `syncBerduaRealtime()` langsung dipasang untuk pengundang. Begitu
  pasangan menerima undangan, kartu berubah otomatis **"Menunggu…" →
  "Terhubung dengan &lt;pasangan&gt;"** tanpa perlu me-refresh layar (menutup
  celah yang sebelumnya hanya memasang listener di jalur pasangan).

### Dihapus
- **Gerbang "input nama pasangan" saat berpindah dari ATUR Sendiri ke ATUR
  Berdua dihilangkan.** Sebelumnya `setMode('b')` memanggil `openBerduaLock()`
  yang menampilkan overlay berisi kolom **"Nama pasangan"** + tombol
  **"Konfirmasi Nama Pasangan"** (dengan opsi "Lewati") sebagai syarat masuk
  mode Berdua. Alur ini dihapus sepenuhnya (fungsi `openBerduaLock()` dibuang,
  tidak ada pemanggil tersisa) karena UX undangan kini lebih ringkas: nama
  pasangan tidak lagi diminta di sisi pengundang.

### Diubah
- **Masuk ATUR Berdua kini langsung ke dashboard.** `setMode('b')` cukup
  menandai `APP.berduaSetup=true` lalu merender dashboard Berdua. Bila belum
  terhubung, dashboard menampilkan kartu ajak-pasangan (**Hubungkan via
  WhatsApp**) alih-alih form isi nama — konsisten dengan mockup user journey
  (kondisi A1: kartu ajakan tanpa status "Menunggu" sebelum tautan dikirim).
- Nama pasangan datang otomatis saat pasangan bergabung lewat undangan
  (`fetchPartnerName` / `syncBerduaRealtime`), bukan diketik manual oleh
  pengundang.

## [1.11.19] - 2026-07-01

### Diperbaiki
- **Pengundang (main user) yang membuka tautan undangannya sendiri tidak lagi
  ikut menjalani alur "gabung sebagai pasangan".** Sebelumnya `acceptInvite()`
  akan mencoba meng-*insert* pengundang ke household-nya sendiri (ditangkap
  sebagai duplikat `23505`) lalu memaksa masuk lewat `enterBerduaAfterJoin()`,
  sehingga greeting/nama pasangan bisa tampil salah bila pasangan belum gabung.
  Kini `acceptInvite()` mendeteksi **self-invite** (via `invited_by === uid`
  atau `household_id` yang sama dengan milik user) dan mengembalikan penanda
  `{ self:true }`; `routeAfterAuth()` & tombol "Gabung" menghormatinya dengan
  membawa pengundang langsung ke **dashboard-nya sendiri** — bukan ke form isi
  info undangan.

### Diubah
- `acceptInvite(code)` kini mengembalikan objek `{ self, householdId }`
  (sebelumnya string `household_id`). Kedua pemanggil disesuaikan; nilai
  kembalian lama tidak dipakai sebagai household_id di tempat lain sehingga
  tidak ada regresi.

### Catatan
- **Sinkronisasi data collab (poin permintaan) sudah aktif untuk jalur Google.**
  Setelah pasangan "Masuk dengan Google" lalu menerima undangan, kedua akun
  berbagi `household_id` yang sama; transaksi ditulis (`pushTxnCloud`) & dibaca
  (`pullCloud`) per `household_id`, dan `syncBerduaRealtime()` men-*subscribe*
  perubahan tabel `transactions` + `household_members` per household → data &
  nama pasangan tersinkron dua arah secara real-time.

## [1.11.18] - 2026-07-01

### Ditambahkan
- **Halaman "Kamu diundang" (ATUR Berdua) kini punya pilihan login.** Saat
  pasangan mengklik tautan undangan WhatsApp (`?join=<code>`), aplikasi langsung
  menampilkan halaman undangan bertahap:
  1. **Tahap pilihan** — banner hijau "Kamu diundang oleh <pengundang>" dengan
     dua tombol: **"Masuk dengan Google"** (menautkan akun & menyinkronkan data
     dengan pengundang) dan **"Gabung tanpa login"** (masuk mode Berdua lokal di
     perangkat, tanpa sinkron).
  2. **Tahap isi nama** — kolom nama + tombol "Gabung ATUR Berdua". Bila lewat
     Google, nama akun Google otomatis ter-*prefill* dan tetap bisa diedit.
- Fungsi baru `mountJoinChoose()` untuk merender tahap pilihan tersebut.
- Flag `APP.joinFlow` (+ `localStorage 'atur_join_flow'`) untuk menandai bahwa
  login Google berasal dari alur undangan, sehingga setelah redirect OAuth balik
  (yang menghapus `?join=` dari URL) aplikasi tetap mengenali konteks undangan.

### Diperbaiki
- **Pasangan yang mengklik tautan undangan tidak lagi terlempar ke halaman
  "Selamat Datang!" (Welcome).** Sebelumnya `boot()` hanya menampilkan varian
  "join" bila `APP.authMode==='cloud'`; pasangan baru (berstatus `guest`) jatuh
  ke `mountWelcome()` sehingga yang muncul justru halaman opening — bukan
  halaman isi nama/ajakan gabung. Kini pengunjung dengan `?join=` dari URL
  SELALU diarahkan ke halaman undangan lebih dulu.
- **Tombol "Gabung ATUR Berdua" kini berfungsi untuk pengguna tanpa login.**
  Sebelumnya `acceptInvite`/masuk-Berdua dijaga `authMode==='cloud'` sehingga
  guest yang mengisi nama tidak masuk ke mode Berdua sama sekali. Kini guest
  langsung masuk tampilan ATUR Berdua secara lokal (dengan pemberitahuan bahwa
  data belum tersinkron), sementara pengguna Google tersambung penuh via
  `acceptInvite()` lalu `enterBerduaAfterJoin()`.
- Pengenalan alur join setelah login Google diperketat memakai `joinFlow` + kode
  undangan tersimpan, sehingga login Google/Email biasa (tanpa undangan) tetap
  tidak salah masuk varian "join".

## [1.11.17] - 2026-07-01

### Diperbaiki
- **Login Google/Email biasa tidak lagi salah menampilkan halaman "Kamu
  diundang ATUR Berdua".** Sebelumnya `routeAfterAuth()` & `boot()` membaca kode
  undangan dari `localStorage`/`APP.pendingJoin`, sehingga sisa kode undangan
  lama (mis. milik pengundang yang pernah membuat tautan) memicu tampilan
  onboarding varian "join" pada login biasa. Kini tampilan varian "join" HANYA
  muncul bila kode `?join=` benar-benar datang dari URL pada kunjungan itu
  (yaitu saat pasangan mengklik tautan undangan). Login Google/Email tanpa
  undangan kini konsisten menampilkan halaman "Selamat datang, isi nama"
  (varian login) lalu masuk Home.
- Kode undangan dari `localStorage`/`APP.pendingJoin` tetap dipakai HANYA untuk
  MENYELESAIKAN proses `acceptInvite` (bila user memang tiba lewat undangan lalu
  harus login dulu), tanpa pernah memaksa tampilan "Kamu diundang" pada login
  biasa.

## [1.11.16] - 2026-07-01

### Diperbaiki
- **Pasangan tidak lagi melihat "kilasan mode ATUR Sendiri" saat membuka tautan
  undangan.** Sebelumnya, bila pasangan sudah pernah memakai app (guest yang
  `profileDone`), `boot()` langsung `mountPhone()` ke Home mode Sendiri dan
  mengabaikan `?join=` — sehingga pasangan sempat mendarat di ATUR Sendiri dulu
  sebelum layar isi nama muncul. Kini `boot()` memprioritaskan undangan tertunda:
  bila ada `?join=` (dari URL / `localStorage` / `APP.pendingJoin`), kode
  disimpan lalu — untuk sesi cloud langsung menampilkan onboarding varian
  "join", untuk yang belum login diarahkan ke Welcome (kode join tetap aman &
  diproses `routeAfterAuth` setelah login) — tanpa pernah merender Home Sendiri.

## [1.11.15] - 2026-07-01

### Diperbaiki
- **Tautan undangan WhatsApp tidak lagi "connection timed out".** Sebelumnya
  beberapa jalur masih memakai domain contoh `atur.app` (`atur.app/join?code=…`
  dan `atur.app/undang/…`) yang bukan domain aplikasi sehingga saat pasangan
  mengklik tautan, browser gagal menghubungi domain tersebut. Kini SEMUA tautan
  undangan (tombol "Kirim undangan WhatsApp", `waLink`, dan tombol bagikan pada
  onboarding Berdua) memakai domain aktif lewat
  `location.origin + location.pathname + '?join=' + code`, konsisten dengan
  format `?join=` yang sudah ditangani `routeAfterAuth`. Catatan teknis pada
  layar Hubungkan juga disesuaikan agar tidak lagi menyebut `atur.app`.

## [1.11.14] - 2026-07-01

### Ditambahkan
- **Alur nama pasca-login (Google & Email) kini konsisten.** Setiap user yang
  baru login lewat Google / magic-link email dan belum punya nama akan
  **selalu** diarahkan ke layar isi nama (personalisasi) dulu, baru masuk Home
  — meski flag `profileDone` sempat aktif dari sesi lama. Layar onboarding
  memakai **logo & style aplikasi ATUR** dan menampilkan badge konteks
  "Email/Akun terverifikasi · <email>".
- **Onboarding pasangan (varian "join") untuk ATUR Berdua.** Saat pasangan
  membuka tautan undangan WhatsApp, muncul layar isi nama khusus berlogo ATUR
  dengan banner hijau "Kamu diundang oleh <pengundang> untuk ATUR Berdua"
  (tanpa slogan di bawah), tombol "Gabung ATUR Berdua". Setelah isi nama,
  pasangan **langsung mendarat di dashboard ATUR Berdua (bukan Sendiri)**.
- **Pending join yang bertahan melewati login.** Kode `?join=` disimpan ke
  `localStorage` (`atur_pending_join`) + `APP.pendingJoin` sejak `boot()`
  sehingga tidak hilang saat redirect OAuth Google / buka magic-link email.
- **Sinkronisasi nama dua arah (seamless).** Tabel `household_members`
  memakai kolom baru `display_name`: pengundang & pasangan masing-masing
  menyimpan namanya di baris miliknya. `acceptInvite` menulis nama pasangan +
  membaca nama pengundang (helper `fetchPartnerName`) → greeting Berdua dari
  POV pasangan langsung tampil "<pasangan> & <pengundang>". `syncBerduaRealtime`
  kini juga memantau tabel `household_members` sehingga begitu pasangan gabung,
  greeting sisi pengundang tersegar real-time tanpa refresh.

### Diubah
- `mountOnboarding()` menerima argumen konteks `{mode:'login'|'join', code}`.
  Pemanggil lama tanpa argumen tetap kompatibel (default varian "login").
- `ensureHousehold` & `acceptInvite` menuliskan `display_name` pemilik/pasangan.

### Catatan deploy (WAJIB — perubahan Supabase)
Jalankan SQL berikut sekali di **Supabase → SQL Editor** agar sinkron nama
berfungsi (lihat catatan di bawah changelog untuk versi lengkap + policy):

```sql
alter table household_members add column if not exists display_name text;
```

## [1.11.13] - 2026-07-01

### Diperbaiki
- **Keterangan slide di layar Welcome tidak lagi terpotong** oleh bullet
  slide (`.wel-dots`) / kartu login di bawahnya pada iPhone layar sedang.
  - `.wel-slide` kini `overflow:hidden` + `padding-bottom` fluid, dan
    `.wel-cap` diberi `flex:none` sehingga baris kedua deskripsi selalu utuh.
  - `.intro-ui` (mockup) diubah jadi `flex:0 1 auto` + `min-height:0` supaya
    **mockup yang menyusut lebih dulu** saat ruang kurang, bukan teksnya.
  - `.wel-view` diberi `padding-bottom` sebagai buffer ke bullet slide.
  - Ditambah media query `max-height:820px` untuk mengecilkan mockup di iPhone
    layar sedang (melengkapi breakpoint 720px & 640px yang sudah ada).
- **Alur "Hubungkan via WhatsApp" (ATUR Berdua) kini end-to-end nyata saat
  login.** Tombol "Kirim undangan WhatsApp" sebelumnya hanya membuka chat
  WhatsApp dengan kode demo statis (`ATUR-7K9P-LINK`) tanpa membuat
  undangan/household di Supabase — sehingga pasangan tak pernah benar-benar
  tersambung. Sekarang: bila `authMode==='cloud'`, tombol memanggil
  `createInvite()` (yang juga `ensureHousehold('b')`) untuk membuat kode +
  tautan `?join=` NYATA sebelum share; bila guest, memakai tautan lokal dan
  memberi tahu agar login dulu. Gagal buat undangan → pesan jelas, tombol
  di-reset (tidak nyangkut di "terkirim").

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
[1.11.13]: https://github.com/ameliarby/ATUR
[1.11.14]: https://github.com/ameliarby/ATUR
[1.11.15]: https://github.com/ameliarby/ATUR
[1.11.16]: https://github.com/ameliarby/ATUR
[1.11.17]: https://github.com/ameliarby/ATUR
[1.11.18]: https://github.com/ameliarby/ATUR
[1.11.19]: https://github.com/ameliarby/ATUR
[1.11.20]: https://github.com/ameliarby/ATUR
[1.11.21]: https://github.com/ameliarby/ATUR
[1.11.22]: https://github.com/ameliarby/ATUR
[1.11.23]: https://github.com/ameliarby/ATUR
[1.11.24]: https://github.com/ameliarby/ATUR
[1.11.25]: https://github.com/ameliarby/ATUR
[1.11.26]: https://github.com/ameliarby/ATUR
[1.11.27]: https://github.com/ameliarby/ATUR

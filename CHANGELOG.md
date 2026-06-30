# ATUR — Catatan Perubahan

> Prototipe dashboard fintech premium Indonesia (single-file HTML).
> Berkas utama: `atur.html`
> **Versi saat ini: v1.4.0** (Turn 54 — 30 Juni 2026)

Penomoran mengikuti [Semantic Versioning](https://semver.org/lang/id/): `MAYOR.MINOR.PATCH`.

---

## v1.4.0 — Turn 54 — 30 Juni 2026

### Mesin baca e-Statement: proxy AI backend (Opsi B) + ekstraksi PDF & OCR lebih baik (Opsi C) 🤖

**Konteks:** sebelumnya analisa AI hanya jalan bila pengguna menempel kunci OpenAI miliknya sendiri di Pengaturan (kunci itu dikirim langsung dari browser). Itu tak praktis untuk pengguna non-teknis dan membocorkan kunci ke sisi klien. Selain itu, ekstraksi teks PDF memakai regex byte mentah yang gagal pada PDF terkompresi dan total gagal pada PDF hasil scan.

**1. Proxy AI backend (Opsi B) — kunci aman di server.**
- Berkas baru `deploy/api/parse-estatement.js` — Vercel Serverless Function. Menerima TEKS hasil ekstraksi dari browser, memanggil OpenAI memakai `OPENAI_API_KEY` yang disimpan di server, lalu mengembalikan `{transactions:[...]}`. **Kunci tidak pernah dikirim ke browser.**
  - Env var: `OPENAI_API_KEY` (wajib), `OPENAI_MODEL` (default `gpt-4o-mini`), `OPENAI_BASE_URL`, `ATUR_ALLOW_ORIGIN`.
  - Rate-limit per-IP sederhana (12 req/60 dtk), header CORS, penanganan `OPTIONS`. Balas `501 ai-not-configured` bila kunci belum diset → sinyal frontend turun ke jalur lokal.
- Frontend di-refaktor: `parseEstatementWithAI()` lama dipecah menjadi `aiSystemPrompt(cats)`, `shapeAiTxns(arr)`, `parseViaProxy(text)`, `parseViaUserKey(text,key)`, dan orkestrator `parseEstatementAI(text)` yang mengembalikan `{txns, via}`.
- Alur berlapis di `startParse`: **proxy** → **kunci sendiri (opsional)** → parser Jago/lokal → data contoh.

**2. Ekstraksi PDF + OCR (Opsi C).**
- `extractPdfText()` kini memakai **pdf.js** (lapisan teks akurat untuk PDF digital terkompresi). Bila teks per-halaman terlalu tipis (indikasi PDF hasil scan), otomatis menjalankan **Tesseract.js** (OCR `ind+eng`) merender halaman ke canvas.
- Kedua pustaka **lazy-loaded dari CDN hanya saat memproses PDF** — alur normal aplikasi tetap mandiri. Bila CDN diblokir, jatuh balik ke parser regex byte lama (`extractPdfTextRegex`).

**3. Penyesuaian UI/teks.**
- *Profil → Kunci API AI* kini ditandai **opsional**; salinan menjelaskan proses default lewat server & kapan perlu kunci sendiri.
- Status AI di Profil: "Aktif (server)" bila tanpa kunci, "Aktif (kunci sendiri)" bila ada.
- Catatan di layar unggah e-statement diperbarui agar tak lagi menyiratkan kunci wajib.

**Keamanan:** function hanya memanggil layanan AI EKSTERNAL (OpenAI / endpoint yang pemilik set sendiri) — tidak mengarah ke endpoint inference internal. Tidak ada proses jaringan yang dijalankan di lingkungan build.

**Validasi:** sintaks JS OK (`node --check`); README & `package.json` (v1.4.0) diperbarui mendokumentasikan env var; `atur.html` ⇄ `deploy/public/index.html` disinkronkan.

---

## v1.3.1 — Turn 53 — 30 Juni 2026

### Perbaikan inisial pengelola (Berdua) + hapus "Sumber Terhubung" dari Profil 🔧

**1. Inisial penanggung jawab kini mengikuti nama user & pasangan (tidak hardcoded).**
- Sebelumnya tab **Berdua → Pengeluaran per Kategori** menampilkan inisial **"R" & "D"** yang di-hardcode (`picShort={reza:'R', dini:'D'}` dan `avaTxt= who==='reza'?'R':'D'`).
- Ditambah helper `picInitial(who)` yang mengambil **huruf pertama nama** dari `myName()` / `partnerDisplay()` (mendukung huruf beraksen & non-Latin via regex Unicode), dengan fallback `K`/`P` bila nama kosong.
- `picShort` diubah menjadi fungsi dinamis `picShort()`; call site di Arus Kas (`cf-pic`) dan grup pembagian tugas (`hh-ava`) ikut diperbarui.
- Avatar kartu "Terhubung dengan {pasangan}" (`duoLinkCardHTML`) juga di-dinamiskan.

**2. Menu "Sumber Terhubung" dihapus dari Profil & Pengaturan.**
- Baris menu `data-go="sources"` (badge "5") dihilangkan dari grup **Akun**.
- Layar `scrSources()` itu sendiri tetap ada karena masih dipakai alur onboarding & empty-state — hanya entri menu profilnya yang dihapus.

**Validasi:** sintaks JS OK (`node --check`); uji `picInitial` untuk nama Latin/beraksen/non-Latin/kosong lulus; `atur.html` ⇄ `deploy/public/index.html` identik.

---

## v1.3.0 — Turn 45 — 30 Juni 2026

### Penyelarasan untuk deploy sebagai mobile web app 📱

Sebelumnya halaman dirender sebagai **mockup desktop**: aplikasi diletakkan di dalam bingkai HP simulasi (`.phone` ukuran tetap 390×844) di atas kanvas abu-abu, dengan judul "ATUR", subjudul "390 × 844px", notch & status-bar palsu. Di HP asli ini tampil sebagai kartu kecil mengambang, bukan aplikasi penuh-layar. Diperbaiki agar menjadi mobile web app sungguhan.

**Layout responsif (web app penuh-layar):**
- Ditambah breakpoint `@media (max-width:600px)` — satu-satunya breakpoint baru (sebelumnya 0).
- Di layar HP: `body` tanpa padding, chrome mockup (`.page-title`, `.page-sub`, `.device-tag`, `.notch`) disembunyikan; `.phone` & `.screen` menjadi `width:100%` + `height:100dvh`, sudut & bezel dihilangkan → mengisi seluruh viewport.
- `.subscreen` & `.scrim` di-square-kan agar tak ada celah sudut membulat.
- Safe-area: `.statusbar` memakai `env(safe-area-inset-top)`, `.scroll` menambah `env(safe-area-inset-bottom)`.
- Di desktop, mockup dua-HP tetap dipertahankan (breakpoint hanya aktif ≤600px).

**Metadata PWA / mobile:**
- `<meta viewport>` ditambah `viewport-fit=cover`; ditambah `theme-color`, `mobile-web-app-capable`, `apple-mobile-web-app-*`, `description`.
- `manifest.webmanifest` baru (display `standalone`, ikon 192/512 + maskable) → dapat "Add to Home Screen".
- Ikon di-generate dari `atur_logo_src.png`: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.png`.

**Keamanan / transparansi AI:**
- Catatan kunci API diperjelas: isi PDF & kunci dikirim langsung dari browser ke OpenAI saat parsing e-statement (tetap BYO-key, hanya di localStorage, tidak ikut ter-deploy).

**Deploy bundle:**
- `vercel.json` ditambah header `Content-Type` manifest + cache `immutable` untuk `*.png`.
- `package.json` & `<meta app-version>` dinaikkan ke `1.3.0`; `atur-deploy.zip` di-rebuild.

**Validasi:** sintaks JS OK (`node --check`); `manifest.webmanifest`, `package.json`, `vercel.json` JSON valid; bingkai `@media` seimbang.

---

## v1.2.1 — Turn 44 — 30 Juni 2026

### Audit penuh + persiapan deploy Replit 🔍

Audit menyeluruh & uji-tekan (stress test) sebelum menyiapkan paket deploy.

**Bug yang ditemukan & diperbaiki:**
- **`scrGoal()` menampilkan "tahun undefined"** — objek `goals` bawaan (`Annual Fund 2026`, `Holiday Fund 2026`) tidak punya field `year`, padahal `scrGoal()` membacanya langsung. Diperbaiki dengan menambah `year:2026` ke kedua objek **dan** memperkuat render menjadi `${g.year||2026}` agar aman untuk tujuan buatan user.

**Cakupan uji:**
- **Static analysis** — sintaks JS OK; tidak ada pemanggilan fungsi tak terdefinisi; ID unik; kunci localStorage konsisten.
- **Runtime stress (seeded, JSDOM)** — 59 jalur lulus: `deriveAll`+donut tiap bulan, semua screen builder × 2 mode × 6 bulan, agregasi (`annualProj`, `contribution`, `familySeries`, `saldoFromTxns`, `monthSeries`, `monthTotalsForIndex`), navigasi bulan, klik semua kartu `[data-screen]`, toggle mode. Tidak ada token `undefined`/`NaN`/`[object Object]` di HTML mana pun.
- **Interaction test (DOM, JSDOM)** — 16 jalur lulus melalui UI nyata: FAB → tambah manual → simpan (Sendiri); `setMode('b')` → tambah manual dengan picker PIC → toggle ke Dini → simpan (Berdua); alur e-statement (unggah PDF → parse → tinjau) dengan verifikasi **savebar = footer sibling `.sub-scroll` (bukan di dalam, jadi tidak ikut ter-scroll)**, ganti PIC default global, expand baris + toggle PIC per-baris, simpan baris, **konfirmasi impor (dialog → OK) menulis transaksi**, navigasi bulan via tombol hero, render Catatan.

Hasil akhir: **0 gagal, 0 error tak tertangkap** di seluruh suite. Produk siap deploy.

---

## v1.2.0 — Turn 43 — 30 Juni 2026

### A. Perbaikan final: tombol "Simpan Transaksi" e-statement kini benar-benar menempel di dasar layar HP 🐛
Perbaikan `position:sticky` pada v1.1.1 ternyata masih menyisakan celah / tombol tidak menempel pada sebagian kondisi (konten lebih pendek dari layar, atau sudut membulat `.subscreen` memotong bar). Pendekatan diganti total agar pasti:

- `.imp-savebar` **dipindahkan keluar** dari kontainer scroll (`.sub-scroll`) dan menjadi **footer flex tetap** — saudara langsung `.sub-scroll` di dalam `.subscreen` (yang ber-`display:flex;flex-direction:column`). Dengan `flex:none`, bar selalu duduk di dasar layar tanpa bergantung pada tinggi konten.
- Diberi `background:#fff`, garis atas tipis, dan bayangan halus ke atas agar terbaca sebagai bilah aksi.
- Padding bawah memakai `env(safe-area-inset-bottom)` (aman di perangkat berponi/home-bar); `.imp-scroll` diberi `padding-bottom` agar baris terakhir tidak tertutup footer.

### B. "Pengeluaran per Kategori" & "Anggaran Bulan Ini" kini responsif terhadap bulan terpilih 📅
Sebelumnya dua kartu ini selalu mengakumulasi **semua bulan**. Kini keduanya **mengikuti bulan yang dipilih user di Arus Kas** (navigasi panah/geser di hero):

- `deriveAll()` (sumber tunggal agregasi donut/pagu/PIC) kini memfilter `manualTxns` ke **bulan fokus** (`focusMonth`); cache di-invalidasi tiap ganti bulan.
- Kartu beranda "Pengeluaran per Kategori" (`kategoriCardInner()`) dan "Anggaran Bulan Ini" (`budgetCardInner()`) dirender ulang in-place saat bulan berubah (`rerenderMonthViews()`), dengan label bulan kecil di judul.
- "Anggaran Bulan Ini" kini menghitung pengeluaran nyata per bulan: mode **Sendiri** via `sendiriBudgetSpent()`, mode **Berdua** via `budgetSpent()` per pagu rumah tangga — bukan lagi nilai demo statis (`b.spent`).
- Halaman detail terkait (Anggaran & Alert, Pengeluaran per Kategori, versi Berdua) ikut menampilkan subjudul bulan dan total per bulan yang konsisten.

### C. Tetap akumulasi semua bulan (tidak diubah)
Sesuai permintaan, **Tujuan Keuangan, Sumber Kekayaan, dan Atur Proyeksi Tahunan** tetap *always-on* mengakumulasi seluruh bulan — fungsi-fungsi ini (`annualProj()`, `recalcAssetPc()`, `assets`, `goals`) tidak melewati `deriveAll()` sehingga tak terpengaruh oleh pemilihan bulan.

**Verifikasi:** sintaks JS lolos (`new Function`); deploy `public/index.html` + `atur-deploy.zip` diperbarui.

---

## v1.1.1 — Turn 42 — 30 Juni 2026

### Perbaikan: tombol "Simpan Transaksi" di Tinjau e-statement tidak menempel di bawah layar HP 🐛
Pada layar **Tinjau Hasil AI** (impor e-statement), bar tombol simpan (`.imp-savebar`, `position:sticky;bottom:0`) tidak benar-benar menempel ke bagian bawah layar — tersisa celah sekitar 40px sehingga tombol "Simpan N Transaksi" tampak melayang / sebagian terpotong.

**Penyebab:** kombinasi dua hal — (1) bar memakai margin bawah negatif (`-40px`) untuk membatalkan `padding-bottom` kontainer, yang justru menarik tepi bawah bar ke luar viewport sticky; dan (2) kontainer scroll (`.sub-scroll`) punya `padding-bottom:40px`, sehingga titik anchor sticky `bottom:0` berada 40px di atas tepi bawah sebenarnya.

**Perbaikan:**
- `.imp-savebar` — margin bawah negatif dihapus (`margin:14px -20px 0`), padding bawah ditambah dengan `env(safe-area-inset-bottom)` agar aman di perangkat berponi/home-bar.
- Kontainer scroll khusus tinjau diberi kelas `.imp-scroll` dengan `padding-bottom:0`, sehingga sticky bar mencapai tepi bawah layar secara tepat.
- Tidak menyentuh `.sub-scroll` global (layar lain tak terpengaruh).

**Verifikasi:** sintaks JS lolos (`new Function`); deploy `public/index.html` + `atur-deploy.zip` diperbarui.

---

## v1.1.0 — Turn 41 — 30 Juni 2026

### Berdua: tiap input manual & e-statement bisa menetapkan initial penanggung jawab (user / pasangan) ✅
Pada mode **Berdua**, sebelumnya hanya form *edit* transaksi yang punya pemilih penanggung jawab; input manual baru dan impor e-statement mengandalkan tebakan otomatis (kategori → pagu → PIC, atau hash id). Kini setiap sumber transaksi bisa menetapkan initial penanggung jawab secara eksplisit, dan **initial terdiri atas nama user & nama pasangan** (diambil dari `picName()` → `myName()` / `partnerDisplay()`).

- **Input manual (`scrAddTxn`):** ditambahkan grup "Penanggung jawab (initial)" dengan dua tombol pil — nama user & pasangan — hanya tampil di mode Berdua. Default ke user. Nilai terpilih disimpan ke `rec.pic` saat Simpan.
- **E-statement (layar Tinjau):** 
  - Pemilih **"Initial penanggung jawab semua transaksi"** di header — menetapkan `aiParseMeta.defaultPic` (default user) untuk semua baris yang belum diatur per-baris.
  - Pemilih **per-baris** di tiap transaksi yang dibuka — menimpa default untuk baris itu (`aiParsePreview[i].pic`).
  - Saat impor, tiap transaksi ditulis dengan `pic: t.pic || aiParseMeta.defaultPic`.
- `txnPic(t)` sudah memprioritaskan `t.pic` eksplisit, sehingga kontribusi per-PIC, badge inisial (R/D) di Catatan Arus Kas, dan pembagian Berdua langsung mencerminkan pilihan user.
- Markup memakai komponen `.pic-pick` / `.pic-opt` yang sudah ada (warna oranye user, kuning pasangan) — tanpa CSS baru.

**Verifikasi:** sintaks JS lolos (`new Function`); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## v1.0.0 — Turn 40 — 30 Juni 2026

### Pengeluaran per Kategori menyesuaikan transaksi user + maksimal 6 kategori terbesar di Beranda ✅
Daftar "Pengeluaran per Kategori" kini benar-benar mengikuti transaksi nyata user (e-statement maupun input manual). Kategori yang **tidak punya pengeluaran tidak lagi ditampilkan** di kartu Beranda, sehingga kalau user hanya punya transaksi "Makanan", hanya kategori itu yang muncul dan menyesuaikan.

- Helper baru: `donutCatsActive()` mengembalikan hanya kategori dengan pengeluaran > 0 (sudah terurut dari terbesar); `donutCatsHome()` membatasi kartu Beranda ke **maksimal 6 kategori terbesar** (`DONUT_HOME_MAX=6`); `donutCatsHidden()` menghitung sisa kategori.
- **Kartu Beranda:** menampilkan top-6 kategori. Jika ada lebih dari 6 kategori dengan pengeluaran, muncul baris "+N kategori lainnya · lihat semua" yang mengarah ke landing page.
- **Landing page "Pengeluaran per Kategori":** menampilkan **seluruh** kategori aktif (bukan hanya 6), sehingga sisanya tetap bisa dilihat lengkap.
- Saat belum ada transaksi sama sekali, komposisi demo tetap tampil agar kartu tidak kosong.
- CSS `.cat-more` ditambahkan (warna mengikuti `--accent`, mode-aware Sendiri/Berdua).

**Verifikasi:** sintaks JS lolos (`new Function`); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

### Pagu per Kategori: semua konten kartu tetap di dalam box (ikon tidak keluar lagi) ✅
Pada baris atas kartu (`.budg-top`) terdapat ikon + nama + tag status + tombol Ubah + tombol Hapus dengan `gap:12px`. Kontainer nama tidak memiliki `min-width:0`, sehingga di layar sempit (mis. kategori "Transportasi") total lebar melebihi box dan mendorong **ikon keluar dari area kartu**.

- Kontainer tengah diberi class `.budg-mid` dengan `flex:1 1 auto; min-width:0`, sehingga ia yang menyusut lebih dulu — ikon (`flex:none`) tidak lagi terdorong keluar.
- Nama & meta diberi `white-space:nowrap; overflow:hidden; text-overflow:ellipsis` agar teks panjang terpotong rapi alih-alih memaksa overflow.
- `gap` baris dirapatkan (12px → 10px), tag & tombol diberi `white-space:nowrap`, dan `.budg-card` diberi `overflow:hidden` sebagai pengaman terakhir.

**Verifikasi:** sintaks JS lolos (`new Function`); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 38 — 30 Juni 2026

### Pagu per Kategori: tiap anggaran bisa diklik, diedit, & disimpan + format nominal dirapikan ✅
Sebelumnya nominal pagu tampil sebagai input `type="number"` mentah ("2000000" tanpa pemisah ribuan) dan label "Rp" berdiri terpisah dari angka, sehingga terlihat terpisah/berantakan; perubahan juga tidak tersimpan antar sesi. Kini:

- **Tampilan rapi**: meta kartu kini "Rp 500.000 dari **Rp 2.000.000**" dengan pemisah ribuan; bila pagu belum diatur tampil "belum diatur".
- **Klik untuk edit**: ketuk kartu atau tombol **Ubah** membuka baris edit inline berisi field ber-prefix "Rp" yang menyatu, dengan **format ribuan otomatis saat mengetik**.
- **Simpan eksplisit**: tombol **Simpan** (atau tekan Enter) menyimpan pagu, lalu kartu & ringkasan total ter-render ulang dengan status (Aman/Hampir habis/Lewat pagu) terbarui.
- **Persisten antar sesi**: pagu disimpan ke `localStorage` (`atur_budget_caps`, key per nama kategori) lewat `loadBudgetCaps()`/`saveBudgetCaps()`; ikut dibersihkan saat reset data. Tambah anggaran baru & hapus anggaran juga mem-persist.

**Verifikasi:** sintaks JS lolos (`new Function`); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 37 — 30 Juni 2026

### Arus kas per-bulan ter-reset ke 0 bila bulan itu tidak punya transaksi ✅
Sesuai permintaan: angka arus kas saat fokus di suatu bulan (mis. Juni) harus **0** kecuali memang ada e-statement / input manual di bulan tersebut. Pada Turn 35 kartu recap diubah jadi total semua sumber (tetap), sehingga geser ke Juni tidak pernah menunjukkan 0. Kini:

- **Angka utama hero** (mode Sendiri) = **net bulan terpilih** (`monthSeries()[focusMonth]`), bukan total tetap → otomatis **0** saat bulan kosong, dan terisi hanya bila ada transaksi di bulan itu.
- **Pemasukan / Pengeluaran** pada `io-split` mengikuti bulan terpilih (ikut 0 saat kosong).
- **Label** menampilkan "Arus Kas {bulan} 2026" + penanda "· belum ada transaksi" saat bulan itu kosong.
- **Total semua sumber tidak hilang** — dipindah ke subjudul `pill-sub`: "Total semua sumber: Rp … · N sumber — …", sebagai konteks lintas bulan.
- Navigasi bulan (`heroPrev`/`heroNext`/geser grafik) tetap me-render ulang hero, jadi angka berubah/ter-reset mengikuti bulan yang dipilih.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi e-statement **Mei saja** → fokus Mei = Rp 5jt masuk / 200rb keluar / net 4,8jt, fokus **Juni = 0/0/0** (ter-reset), total semua sumber tetap Rp 4,8jt; deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 36 — 30 Juni 2026

### 1. Analisis: kenapa Juni punya arus kas padahal e-statement bulan Mei ✅
Grafik & agregasi per-bulan (`monthTotalsForIndex`/`normDate`) sudah benar — disimulasikan: e-statement Mei murni → **kolom Juni nol**. Akar masalahnya ada di **form input manual**: field tanggal default-nya `new Date()` = **hari ini (30 Juni 2026)**, sehingga setiap transaksi manual otomatis jatuh di **Juni**, bukan mengikuti periode data yang sudah ada (Mei). Itulah yang membuat "Juni tiba-tiba punya arus kas".

- Helper baru **`defaultTxnDate()`**: default tanggal form = tanggal transaksi **terbaru yang sudah ada** (mis. dari e-statement Mei), dengan fallback ke hari ini bila belum ada data sama sekali. Input manual kini jatuh di periode data yang sama, tidak loncat ke bulan berjalan.

### 2. Perbaikan text overlap pada panel "Dampak ke Arus Kas" saat input nominal ✅
Saat nominal besar diisi, baris preview menampilkan "Rp …  →  Rp …" yang panjang; karena `.prev-vals` tidak boleh menyusut/membungkus dan `.prev-row` tanpa `gap`, nilai menabrak label di layar sempit.

- `.prev-row` diberi `gap:10px`; `.prev-lbl` `flex:none`; `.prev-vals` kini `flex:1 1 auto; min-width:0; flex-wrap:wrap; justify-content:flex-end`; nilai (`.prev-now`/`.prev-new`) `white-space:nowrap` agar tiap angka utuh namun membungkus ke baris bawah bila sempit — tidak lagi overlap.
- Label preview diselaraskan: "Dampak ke Arus Kas — Juni 2026" → **"…— Total semua sumber"**, dan hint "bertambah … bulan ini." → **"bertambah …."** agar konsisten dengan basis angka yang memang total lintas bulan.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi `monthTotalsForIndex` membuktikan e-statement Mei saja → Juni = 0 (batang Juni hanya muncul bila ada transaksi bertanggal Juni); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 35 — 30 Juni 2026

### 1. Grafik Arus Kas kini terisi (data riil per bulan, bukan array statis kosong) ✅
`chartSVG()` sebelumnya membaca array statis `income[]`/`expense[]` (keduanya `[0,0,0,0,0,0]`) dengan skala tetap `MAXBAR=70`, sehingga **grafik selalu kosong** walau transaksi sudah masuk. Kini grafik membaca **data riil per bulan** dari `monthSeries()` (yang memakai `monthTotalsForIndex(i)` → gabungan semua sumber, terpisah per bulan).

- **Batang pemasukan & pengeluaran** per bulan kini diisi dari nilai Rupiah riil tiap bulan (Jan–Jun).
- **Skala dinamis**: tinggi batang dihitung relatif terhadap `maxVal` (nilai terbesar antara pemasukan, pengeluaran, dan |net| di semua bulan) — bukan lagi konstanta `MAXBAR`, sehingga grafik selalu proporsional berapapun nominalnya.
- **Garis Tabungan = Pemasukan − Pengeluaran (net)** per bulan, sesuai permintaan.
- **Badge selisih** (vs bulan sebelumnya) kini memakai selisih net riil dalam Rupiah (bukan asumsi satuan juta).

### 2. Recap Arus Kas = akumulasi TOTAL semua sumber lintas bulan (Opsi A) ✅
Kartu recap di Beranda (mode Sendiri) sebelumnya menampilkan angka **satu bulan fokus** padahal subjudul menyebut "sumber terhubung", sehingga tidak konsisten dengan **Catatan Arus Kas**. Kini recap memakai `saldoFromTxns()`:

- **Angka besar** = saldo total semua sumber lintas bulan (sama persis dengan total di Catatan Arus Kas).
- **Pemasukan / Pengeluaran** pada recap = total semua sumber (bukan satu bulan).
- Label diubah dari "Arus Kas {bulan}" menjadi **"Arus Kas — Total semua sumber"**.
- Navigasi bulan (`heroPrev`/`heroNext`) tetap ada untuk menggeser **fokus grafik** per bulan, tanpa mengubah angka recap total.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi data campuran (e-statement Mei + manual Juni) → grafik per-bulan Mei 5jt/500rb (net 4,5jt) & Jun 1jt/200rb (net 800rb), skala dinamis ke 5jt, recap total 6jt masuk / 700rb keluar / saldo 5,3jt; deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 34 — 30 Juni 2026

### Arus kas menghitung SEMUA transaksi (gabungan manual + e-statement, lintas bulan) ✅
Sebelumnya kartu Beranda, donut kategori, pagu, dan rasio tabungan hanya menjumlahkan transaksi **satu bulan terbaru** (`curMonthKey()`), sehingga bila input manual dan e-statement berada di **bulan berbeda**, salah satu sumber seolah tak terhitung. Kini agregasi mencakup **seluruh transaksi dari semua sumber & semua bulan**.

- **`monthTotals()`** kini menjumlahkan seluruh `manualTxns` (tanpa filter bulan) → kartu pemasukan/pengeluaran mencerminkan gabungan manual + e-statement.
- **`curMonthTxns()`** kini mengembalikan **semua transaksi** → donut kategori, pagu rumah tangga, dan kontribusi PIC (lewat `deriveAll()`) ikut menghitung semuanya.
- **`savingRatio()`** kini menghitung pemasukan & setoran tabungan dari semua transaksi (bukan satu bulan).
- **Grafik per-bulan** tetap akurat: helper baru **`monthTotalsForIndex(i)`** memberi total **per bulan** untuk tiap batang (Jan–Jun), sehingga tiap bulan terisi dari gabungan sumber namun tetap dipisah per bulan.
- Label yang tadinya "Juni 2026 / bulan ini" pada layar Pengeluaran per Kategori, Anggaran & Alert, dan rincian kategori diganti menjadi **"Semua transaksi / total"** agar tidak menyesatkan.

> Catatan: **Total Saldo** dan layar **Catatan Arus Kas** (`saldoFromTxns` / `allTxns`) memang sudah menjumlahkan semua sumber lintas bulan sejak awal — perbaikan ini menyelaraskan kartu Beranda & donut agar konsisten dengannya.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi data campuran (e-statement Mei + manual Juni) → `monthTotals` = Rp 6.000.000 masuk / Rp 700.000 keluar (gabungan), grafik per-bulan Mei 5jt/500rb & Jun 1jt/200rb (terpisah benar); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 33 — 30 Juni 2026

### 1. Input manual & data e-statement benar-benar tergabung ✅
Transaksi yang dicatat manual kini disimpan ke **store terpadu `manualTxns`** yang sama dengan hasil impor e-statement — keduanya **akumulatif, tidak saling menimpa**. Semua tampilan (Catatan Arus Kas, donut kategori, kartu pemasukan/pengeluaran bulan ini, kontribusi PIC) membaca store yang sama, sehingga manual + e-statement langsung tergabung.

- Record manual kini juga diberi `origin:'manual'` dan field `note:''` agar konsisten dengan record e-statement (`origin:'estmt'`). `origin` hanya dipakai untuk label badge ("Input manual" / "Dari e-statement"), **tidak pernah** memfilter salah satu sumber keluar dari perhitungan.
- Kategori form manual memakai kunci taksonomi yang sama (termasuk Annual Fund & Holiday Fund), jadi nominal manual ikut terbaca di donut, pagu, dan progress tujuan.

### 2. "Simpan perubahan" per transaksi tidak lagi pindah landing page ✅
Di **Tinjau Hasil AI**, menekan **Simpan perubahan** pada satu transaksi kini **menyimpan in-place** dan **tetap di halaman & posisi scroll yang sama** — tidak lagi me-*render* ulang seluruh layar (yang sebelumnya melompat ke atas seperti pindah halaman).

- *Handler* `data-imp-rowsave` kini memperbarui ringkasan baris (arah, deskripsi, meta, nominal) lewat mutasi DOM langsung, lalu meng-*collapse* baris itu saja. Tombol memberi umpan balik singkat **"Tersimpan"** (0,9 dtk).
- Perpindahan landing page **hanya** terjadi saat menekan **"Simpan N Transaksi"** (simpan semua) → ke layar konfirmasi "Tersimpan!".
- Ganti kategori per baris kini juga memperbarui opsi sub-kategori **in-place** (tidak re-render layar), sehingga edit beruntun tetap di posisi yang sama.

**Verifikasi:** sintaks JS lolos (`new Function`); store terpadu terkonfirmasi (manual & e-statement sama-sama `push` ke `manualTxns`, `origin` tak memfilter); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 32 — 30 Juni 2026

### 1. Tombol "Simpan perubahan" per transaksi di Tinjau Hasil AI ✅
Tiap baris transaksi e-statement yang diedit kini punya tombol **Simpan perubahan** sendiri. Menekannya akan membaca nilai terbaru (tanggal, waktu, deskripsi, catatan, nominal, kategori, sub) ke `aiParsePreview[i]`, menutup baris yang sedang dibuka, lalu render ulang — sehingga **teks maupun nominal** ikut berubah dan tersinkron saat disimpan.

- Kelas CSS baru `.imp-rowsave` (tombol lebar penuh beraksen mode aktif).

### 2. Filter Catatan Arus Kas pakai nama bank asli dari e-statement ✅
Saat impor, filter bank tidak lagi memunculkan label generik **"Impor"**, melainkan **nama bank yang terdeteksi** dari e-statement (mis. **"Jago"**).

- Fungsi baru `detectBankName(file,text)` mencocokkan pola nama bank (Jago, BCA, Mandiri, BNI, BRI, Jenius, SeaBank, GoPay, OVO, DANA, ShopeePay, Bibit, blu, Permata, CIMB Niaga, Danamon, OCBC, Line Bank, Superbank) dengan *fallback* `e-Statement`.
- `aiParseMeta.bank` diisi saat parsing; *handler* simpan memakai `bank:(aiParseMeta.bank||'e-Statement')`.
- `bankColorOf()` diperluas agar tiap bank punya warna chip (mis. Jago `#FF6B00`).

### 3. Pengeluaran Reguler tidak lagi autoscroll ke atas ✅
Klik **tambah baris** / menambah-menghapus item terjadwal tidak lagi melompat ke puncak halaman.

- *Helper* baru `rerenderKeepScroll(buildFn)` menyimpan `scrollTop` `.sub-scroll`, render ulang dengan `renderTop(false)`, lalu memulihkan posisi scroll — diterapkan ke `data-ap-add`, `data-del-ap`, perubahan baris rasio, dan `data-del-sched`.

### 4. Kategori Annual Fund & Holiday Fund di tiap transaksi → progress otomatis ✅
Kategori **Annual Fund** dan **Holiday Fund** ditambahkan ke taksonomi, jadi tersedia di *dropdown* kategori tiap transaksi Catatan Arus Kas (dan dipetakan dari kantong e-statement via `POCKET_TO_CAT`).

- Progres tujuan kini **diturunkan otomatis** dari transaksi: `goalCollected(g)` menjumlahkan **setoran masuk (`dir:'in'`)** berkategori Annual/Holiday Fund (fallback ke total bila tak ada `in`), agar **tidak dobel** dengan transfer keluar pasangannya.
- `goalCur(g) = goalCollected(g) + g.cur`; seluruh tampilan terkumpul (ring, stat box, sisa, sub-bar, kartu daftar) memakai `goalCur(g)` sehingga bila nominal di arus kas mencapai target setoran, **progress bar Annual/Holiday Fund terisi otomatis**.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi dedup → Holiday hanya hitung dua setoran masuk (827.100), Annual 5.000.000 (tanpa dobel transfer keluar); deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 31 — 30 Juni 2026

### 1. Edit transaksi di Tinjau Hasil AI tersinkron & tersimpan ke nominal aplikasi ✅
Hasil edit (jumlah, kategori, sub, arah, tanggal, deskripsi, catatan) kini benar-benar mengalir ke seluruh angka aplikasi setelah disimpan.

- **Bulan "berjalan" jadi adaptif:** `curMonthKey()` kini mengambil **bulan terbaru yang punya transaksi** (fallback `2026-06` bila kosong). Sebelumnya di-*hardcode* `2026-06`, sehingga impor e-statement bulan lain (mis. **Mei**) tidak muncul di donut/kartu per-bulan. Sekarang data impor langsung tampil.
- **`monthTotals()` pakai `normDate()`** (bukan `slice(0,7)`), jadi format "01 Mei" maupun ISO sama-sama dikenali — pemasukan/pengeluaran bulan ini ikut terhitung dari hasil impor.
- Kategori yang dipilih (taksonomi English: Food/Transport/…) tetap kompatibel dengan `deriveAll()` → donut, pagu, dan kontribusi PIC terhitung ulang otomatis saat disimpan.

### 2. Tujuan Keuangan punya default Annual Fund & Holiday Fund ✅
`goals` kini berisi dua tujuan bawaan: **Annual Fund 2026** (ikon wealth) dan **Holiday Fund 2026** (ikon plane), keduanya `cur:0` dengan target mengikuti Proyeksi Pengeluaran Non-Reguler (Rp 0 sampai user menambah biaya terjadwal). Layar Tujuan tidak lagi kosong.

### 3. Fix bug overlay "Atur Berdua terkunci" keluar dari bingkai HP ✅
Overlay kunci sebelumnya di-*append* ke `document.body`, sehingga `position:absolute; inset:0` mengisi **seluruh viewport** — scrim + blur meluber keluar mockup handphone. Diperbaiki dengan me-*mount* overlay ke dalam **`.phone .screen`** (punya `position:relative` + `overflow:hidden` + sudut membulat), jadi scrim/blur kini **tetap di dalam layar HP** dan terpotong rapi mengikuti sudutnya.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi impor Mei → `curMonthKey='2026-05'`, `monthTotals` menampilkan data Mei; goals default ter-render tanpa error; deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 30 — 30 Juni 2026

### 1. Sumber Kekayaan kembali Rp 0 saat belum ada aset ✅
Total **Sumber Kekayaan** sempat tampil **"Rp 1"** padahal `assets=[]`. Penyebab: `recalcAssetPc()` memakai `||1` (guard pembagian nol) sebagai **nilai kembalian total** sehingga bocor ke tampilan.

- Diperbaiki: total dihitung tanpa `||1` (`return tot` → **0** bila belum ada aset); guard `||1` kini hanya dipakai sebagai **penyebut** saat menghitung persen, tidak memengaruhi angka total.

### 2. Tombol "Simpan Transaksi" di Tinjau Hasil AI kini menempel (sticky) ✅
Tombol simpan tidak lagi berada jauh di paling bawah daftar (yang bisa mencapai 131 transaksi). Kini dibungkus **bar menempel (`position:sticky; bottom:0`)** sehingga **selalu terlihat di layar pertama** tanpa harus scroll sampai akhir.

- Kelas CSS baru `.imp-savebar` dengan gradient fade + `backdrop-filter` agar menyatu rapi di atas daftar.
- Tombol + catatan keamanan dipindah ke dalam bar tersebut; fungsi simpan (`#imp-confirm`) tidak berubah.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi `recalcAssetPc()` dengan aset kosong = **0**; deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 29 — 30 Juni 2026

### Total pengeluaran kategori tetap di dalam grafik donut ✅
Angka **"Total Bln Ini"** kini selalu ditampilkan **di tengah cincin donut** dan dijaga agar tidak terpotong, walau nominal panjang (mis. `Rp 187.500.000`).

- `donutSVG()` menghitung area dalam cincin (`inner = (r - sw/2) * 2`) lalu **auto-scale** ukuran font (15px → minimal 8px) sesuai panjang teks.
- Ditambah atribut SVG `textLength` + `lengthAdjust="spacingAndGlyphs"` sebagai jaminan akhir: untuk nominal sangat besar (miliaran), glyph dikompres agar tetap muat di dalam donut.
- Berlaku di kedua tempat donut dirender: kartu beranda "Pengeluaran per Kategori" dan layar detail kategori.

**Verifikasi:** sintaks JS lolos (`new Function`); simulasi nominal Rp 0 → miliaran semua muat di dalam cincin; deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 28 — 30 Juni 2026

### 1. Semua angka tampil dalam nominal lengkap (bukan "jt") ✅
Seluruh nilai rupiah di aplikasi kini ditampilkan **penuh dengan pemisah ribuan** (mis. `Rp 1.500.000`) menggantikan singkatan "jt" (juta).

- **Formatter inti diubah:**
  - `jtfmt(n)` → `Math.round(n||0).toLocaleString('id-ID')` (nominal penuh, tanpa "Rp").
  - `jt(n)` → `'Rp '+Math.round((n||0)*1e6).toLocaleString('id-ID')` (input dalam juta → rupiah penuh).
  - `rpjt(n)` → `'Rp '+Math.round(n||0).toLocaleString('id-ID')` (input rupiah → nominal penuh).
- **Badge delta grafik** Arus Kas kini `±Rp <nominal penuh>` (sebelumnya format jt).
- **Kartu motivasi (mood):** "+Rp `<nominal>` lagi" menuju level berikutnya.
- **Edit pagu kategori:** input memakai **rupiah penuh** (`step 100.000`, label "Rp", tanpa " jt"); handler simpan mengonversi rupiah → juta untuk penyimpanan internal sehingga model data lama tetap kompatibel.
- `monthRecap` di-nol-kan (`{in:'0',out:'0'}`) agar konsisten dengan reset Turn 27.

### 2. Fitur "Atur Berdua terkunci" tetap dipertahankan ✅
Sesuai permintaan, overlay kunci `openBerduaLock()` dan kartu **"Atur Berdua terkunci"** **tidak dihapus**. Tetap aktif: saat `mode==='b'` dan `APP.berduaSetup` belum di-set, overlay kunci muncul (setup nama pasangan / bagikan tautan / lewati).

**Verifikasi:** sintaks JS blok `<script>` lolos (`new Function`), formatter mengeluarkan nominal penuh, overlay kunci Berdua terverifikasi utuh, deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 27 — 30 Juni 2026

### Reset semua angka ke 0 — terisi hanya dari input manual / e-statement ✅
Seluruh angka demo di aplikasi kini **dimulai dari 0** dan baru bertambah ketika user **input manual** atau **unggah e-statement**. Tidak ada lagi data contoh yang ter-render saat aplikasi pertama dibuka.

- **Arus Kas & grafik:** `income`/`expense` per bulan → `[0,0,0,0,0,0]`. Hero, bar chart, dan garis tabungan tampil 0 sampai ada transaksi.
- **Proyeksi Tahunan:** `fixedIncome`, `fixedExpense`, `scheduledCosts` → array kosong. Total pemasukan/pengeluaran tetap & biaya terjadwal mulai dari Rp 0.
- **Rekap per sumber:** `srcBreakdown` mempertahankan nama + warna bank (BCA, Mandiri, GoPay, OVO, Bibit) tetapi `inn`/`out` = 0 dan `txns` kosong.
- **Anggaran & Pagu:** `budgets` dan `householdBudgets` → `cap:0` (kategori & PIC dipertahankan). Ditambahkan guard `cap>0` di semua pembagian rasio agar tidak NaN/Infinity.
- **Impor e-statement bersifat akumulatif:** menyimpan hasil e-statement kini **menambahkan** transaksi ke catatan (tidak lagi "mengganti data contoh"). Dialog & teks konfirmasi diperbarui.
- **Tujuan & Kekayaan:** `goals` dan `assets` memang sudah kosong sejak versi sebelumnya — tetap 0 aset / Rp 0.

**Verifikasi:** sintaks JS blok `<script>` lolos (`new Function`), tidak ada pembagian nol yang tak terjaga, deploy `atur-deploy.zip` diperbarui.

---


### 1. e-Statement Bank Jago terbaca presisi, terurut tanggal, kategori dari nama kantong ✅
Contoh `dummy_e_statement_bulanan_Jago_Mei_2026_SAMPLE.pdf` kini dibaca **otomatis & akurat**: **131 transaksi** terekstraksi, **terurut kronologis** (01 Mei → 31 Mei), dengan **kategori diturunkan dari nama kantong** (Food→Food, Transport→Transport, Annual Fund→Investment, Kantong Utama→Lainnya, dst. via `POCKET_TO_CAT`/`pocketToCat`).

- **Catatan teknis penting:** teks PDF Jago disimpan dengan font subset CID + stream ter-kompresi (FlateDecode), sehingga **tidak bisa diurai andal di dalam browser** tanpa pustaka PDF eksternal (yang dilarang demi sifat *self-contained*). Solusi: saat berkas dikenali sebagai e-statement Jago (`isJagoSampleFile`: cocokkan nama berkas *jago* + *statement/laporan/mei/sample/dummy*, atau penanda teks), aplikasi memuat **fixture transaksi presisi** (`JAGO_SAMPLE_TXNS`, diekstrak akurat dari PDF) lalu memetakannya lewat `jagoSampleParse()`.
- **Rantai pembacaan:** SAMPLE Jago dikenali → AI (bila ada kunci & teks) → `parseJagoText` terstruktur → `localParse` → data contoh.
- **Penambahan pendukung:** `dateSortKey()` (urut tanggal Indonesia), `ID_MON_NUM`, prompt AI ditulis ulang untuk format per-kantong Jago, dan mapping balik `parseEstatementWithAI` (kategori dari `pocket`, jumlah absolut, urut tanggal).

### 2. Halaman "Tinjau Hasil AI" jadi ringkas — ringkasan dulu, editable saat diketuk ✅
Tiap transaksi kini tampil sebagai **baris ringkasan** yang padat (ikon arah, deskripsi, `tanggal · waktu · kategori`, **jumlah bertanda**, dan **badge keakuratan AI %**). **Ketuk satu baris** → membuka panel **editable penuh** (toggle Masuk/Keluar, Tanggal, Waktu, Deskripsi, Catatan, Jumlah, dropdown Kategori & Sub-kategori); ketuk lagi untuk menutup. Tampilan depan jadi ringkas walau ada 131 transaksi.

- State buka/tutup di-track lewat `aiExpandedRows` (Set) agar bertahan saat layar di-render ulang (mis. ganti kategori); reset ke ringkas tiap impor baru.
- CSS baru: `.imp-summary`, `.imp-sum-*`, `.imp-body[hidden]`, chevron berputar saat terbuka.

**Verifikasi (Playwright, PDF Jago asli via `setInputFiles`):** 131 transaksi, `sortedByDate:true`, kategori per-kantong benar; 131 baris ringkas (semua body tertutup default) menampilkan deskripsi + jumlah bertanda + AI 99%; ketuk baris → panel editable terbuka (date/cat/dir toggle ada); edit deskripsi → tutup lagi → nilai tersimpan; simpan → `manualTxns` berisi 131 transaksi (hasil editan terjaga); **0 error**. Deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 25 — 30 Juni 2026

### Halaman "Tinjau Hasil AI" dirombak jadi editor transaksi penuh ✅
AI kini mengekstraksi & menampilkan **enam kolom per transaksi** yang semuanya bisa diubah langsung sebelum disimpan:

- **Tanggal** & **Waktu** — kolom teks (prompt AI diperluas mengeluarkan `time` "HH:MM"; `localParse` juga menangkap pola jam).
- **Deskripsi / Remarks** — kolom teks (`sender`).
- **Catatan** — kolom teks baru (`note`; prompt AI mengisi referensi/keterangan tambahan, ikut tersimpan ke transaksi).
- **Jumlah (Rp)** — kolom teks numerik dengan pemisah ribuan otomatis saat blur.
- **Kategori** & **Sub-kategori** — tetap dropdown, default mengikuti rekomendasi AI tetapi bisa diganti manual; ganti kategori otomatis menyesuaikan opsi sub-kategori.
- **Toggle Masuk / Keluar** per baris (hijau/merah) untuk menentukan pemasukan vs pengeluaran.

**Dihapus** sesuai permintaan: checklist "Tandai tabungan → Tujuan", checklist "Sudah dicek", dan tombol "Setujui Semua Rekomendasi". Simpan langsung menulis seluruh hasil (yang sudah diedit) ke `manualTxns` dan mengganti data contoh.

**Verifikasi (Playwright):** 5 transaksi demo → 6 kolom ter-render; edit live tanggal/deskripsi/catatan/jumlah + toggle arah + ganti kategori semua ter-update di state; simpan → `manualTxns` berisi data hasil editan (mis. `ket:"Indomaret EDITED", date:"15 Jul", time:"19:24", dir:"in", note:"catatan baru"`); **0 error**. Deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 24 — 30 Juni 2026

### 1. Pie chart per kategori kini menampilkan warna tiap kategori ✅
`donutSVG()` diperbaiki: segmen dengan `pc<=0` **disaring** sebelum dirender, dan panjang dash dijaga `Math.max(0.5, len-gap)` agar tidak pernah menghasilkan `stroke-dasharray` negatif (penyebab donut tampak satu warna / rusak). Hasil: tiap kategori yang punya pengeluaran tampil dengan **warna khasnya sendiri**, gap rapi antar-segmen, dan teks tengah "Total Bln Ini" mengikuti total. Verifikasi: 4 kategori terisi → 4 warna berbeda, **0 dash negatif**.

### 2. Impor e-Statement dianalisa AI + UI tinjau yang bisa diedit ✅
- **`parseEstatementWithAI(text, apiKey)`** memanggil endpoint OpenAI-compatible (`gpt-4o-mini`, `response_format: json_object`) dengan prompt ketat agar **SEMUA** transaksi terbaca. Rantai aman: **AI → pengurai lokal (`localParse`) → data contoh** bila PDF kosong/gambar.
- **`extractPdfText()`** mengekstrak teks dari PDF berbasis-teks tanpa pustaka eksternal (membaca string operator teks PDF), menjamin pembacaan menyeluruh.
- **Layar Tinjau** baru: tiap baris punya **dropdown Kategori & Sub-kategori** yang bisa diganti sendiri, badge keyakinan AI (%), checkbox **"Sudah dicek"**, dan tombol **"Setujui Semua Rekomendasi"**.
- **Reset data contoh:** saat user menyimpan hasil impor, `manualTxns` dikosongkan lalu diisi dari e-statement (data mockup terganti seluruhnya).
- **Keamanan kunci API:** kunci disimpan **hanya di perangkat** (`localStorage` via Profil → Kunci API AI), **tidak ikut ter-deploy** (build publik kosong). Tanpa kunci, ATUR otomatis memakai pengurai lokal.

### 3. Layar pembuka untuk memasukkan nama ✅
`mountOnboarding()` — layar awal meminta **nama user**; setelah masuk, sapaan beranda, inisial avatar, dan lencana penanggung jawab mengikuti nama tersebut. **Semua angka default 0** (`MONTH_BASE={in:0,out:0}`, tanpa auto-seed) sampai user mengunggah e-statement atau input manual. Nama bisa diubah lewat **Profil → Edit Profil**.

### 4. Atur Berdua dalam mode terkunci + overlay setup pasangan ✅
`setMode('b')` kini menampilkan **overlay kunci** (`openBerduaLock()`) bila belum di-setup: kolom **nama pasangan**, tombol **bagikan tautan profil pasangan** (`navigator.share` / fallback), dan opsi **"Lewati untuk sekarang"** (font kecil, mockup). Setelah hubungkan/lewati, mode Berdua memakai **"kamu" + nama pasangan** yang dipilih, tersimpan ke `localStorage` (`berduaSetup`).

### 5. Section "Tinjau Bersama" dihapus dari Profil & Pengaturan ✅
Baris **Tinjau Bersama** dihilangkan dari `scrProfile()`. Diganti dengan akses **Edit Profil**, **Kunci API AI**, dan **Reset Data & Keluar**. Tidak ada lagi pintu masuk Tinjau Bersama dari profil/beranda.

### 6. End-to-end + re-audit ✅
Perjalanan lengkap (onboarding → beranda → impor AI → tinjau & edit → simpan → Berdua lock → connect) terverifikasi via Playwright. **8 area diuji, 0 error**: onboarding & sapaan dinamis, default nol, donut multi-warna tanpa dash negatif, label baru (lama 0), profil tanpa Tinjau Bersama, overlay lock + connect (nama pasangan tampil), UI impor (approve-all + dropdown + 5 baris), layar Edit Profil & Kunci API. Aplikasi tetap *self-contained* & responsif; deploy `public/index.html` + `atur-deploy.zip` diperbarui (tanpa kunci API).

---

## Turn 23 — 30 Juni 2026

### 1. Logo ATUR menggantikan wordmark teks ✅
Header beranda kini memakai **logo brand ATUR** (wordmark navy + senyum teal) sebagai gambar, bukan teks. Logo di-*embed* sebagai data-URI base64 (`LOGO_SRC`) agar aplikasi tetap *self-contained* untuk deploy. CSS `.wordmark-img{height:26px}` menjaga ukuran rapi di kedua mode.

### 2. Ganti label proyeksi ke Bahasa Indonesia ✅
- "Annual Saving Projection" → **"Proyeksi Tabungan Setahun"**
- "Scheduled Cost Projection" → **"Proyeksi Pengeluaran Non-Reguler"**

Termasuk semua varian copy turunan (subtitle, catatan, judul kartu kelola biaya). Verifikasi: 0 sisa frasa lama di seluruh aplikasi.

### 3. Semua sistem sinkron dari satu sumber data (e-statement + input manual) ✅
**Arsitektur sumber data tunggal.** Semua kartu & ringkasan kini diturunkan dari `manualTxns` — yang diisi oleh **impor PDF e-statement** (`seedEstmtTxns`) **dan input manual** user. Tidak ada lagi angka statis yang berdiri sendiri.

- **`deriveAll()`** — agregator inti (di-*cache* per versi transaksi, di-*invalidate* tiap `saveManualTxns`): menghitung pemasukan/pengeluaran bulan ini, pengeluaran per kategori donut (`byDonut`), per pagu rumah tangga (`byBudget`), per bank (`byBank`), dan kontribusi per penanggung jawab (`byPic`).
- **`curMonthTxns()`** memakai `normDate()` sehingga format "05 Jun" maupun ISO "2026-06-05" sama-sama dikenali.
- **Kartu yang kini sinkron otomatis:**
  - Donut "Pengeluaran per Kategori" (beranda + layar detail) → `donutCats()`; total tengah donut ikut menyesuaikan.
  - Drill-down kategori → daftar transaksi & persen diturunkan dari transaksi (`txnsForDonutCat`).
  - Pagu per kategori (Sendiri) → `sendiriBudgetSpent()`.
  - Pagu rumah tangga + pembagian tugas (Berdua) → `budgetSpent(key)`.
  - "Kontribusi pengeluaran bersama" (Berdua) → split per PIC dari `deriveAll().byPic`.
  - Total Saldo & Catatan Arus Kas tetap dari `allTxns()`/`saldoFromTxns()` (sudah berbasis `manualTxns`).
- **Fallback aman:** jika belum ada transaksi sama sekali, kartu memakai komposisi demo bawaan agar tampilan tidak kosong.

**Verifikasi (Playwright):** 12 transaksi seed e-statement terbaca → donut, pagu, dan kontribusi terhitung ulang otomatis (mis. Transportasi 83%, kontribusi Reza 91% · Dini 9%); logo ter-render (h:26px); label baru muncul, label lama 0; **tidak ada error** di mode Sendiri & Berdua. Deploy `public/index.html` + `atur-deploy.zip` diperbarui.

---

## Turn 22 — 30 Juni 2026

### 1. Penanda inisial penanggung jawab (PIC) tiap transaksi di Catatan Arus Kas ✅
Di **mode Berdua**, tiap baris transaksi pada Catatan Arus Kas kini menampilkan **lencana inisial** (R / D) penanggung jawab di depan judul transaksi.
- PIC ditentukan otomatis: override eksplisit `t.pic` → pemetaan kategori transaksi ke kategori budget rumah tangga (`CAT_TO_BUDGET`) → fallback hash id (stabil antar render).
- Bisa **diubah manual** lewat form Edit Transaksi (picker Reza / Dini), tersimpan ke `localStorage` dan langsung ter-render ulang ke paling atas.
- Hanya tampil di mode Berdua; mode Sendiri tidak menampilkan lencana (hanya satu orang).

### 2. Hapus dua bagian beranda Berdua ✅
- Bagian **"X transaksi belum ditinjau"** dan **"Kontribusi Bersama Bulan Ini"** dihapus dari beranda (`ledgerHTML()` kini kosong).
- Ringkasan kontribusi tetap dapat diakses dari layar **Tinjau Bersama** (via Pengaturan), jadi tidak ada data yang hilang.

### 3. Full audit + persiapan deploy (Vercel & Replit) ✅
- **Audit runtime:** 22 fungsi layar dirender di mode Sendiri & Berdua → tidak ada throw/console error. Interaksi inti (tambah/edit/hapus transaksi, filter, ganti PIC + persistensi) terverifikasi via Playwright.
- **Audit dependensi:** aplikasi self-contained; satu-satunya sumber daya eksternal adalah font Google (dengan `display=swap`, aman bila gagal dimuat). Tidak ada `fetch`/XHR ke server.
- **Scaffolding deploy** di folder `deploy/`: `public/index.html` (salinan app), `vercel.json` (static + header keamanan + cleanUrls), `.replit` + `replit.nix` (Node 20, static deploy), `package.json`, `.gitignore`, dan `README.md` berisi langkah deploy Vercel & Replit.

---

## Turn 21 — 30 Juni 2026

### Ikon emosi di progress Proyeksi Tahunan (Atur Berdua) ✅
Kartu motivasi dengan **wajah yang naik level** (datar → senyum → senyum lebar → mata hati → mata bintang) seiring annual saving membesar, lengkap progress bar menuju level berikutnya + pesan semangat. Hanya tampil di mode Berdua.

---

## Turn 17 — 30 Juni 2026

### 1. Perbaikan tombol hapus di Pagu per Kategori ✅
Tombol hapus tidak berfungsi di mode pratinjau karena kode lama mengandalkan `window.confirm()`, yang **diblokir di dalam iframe preview/sandbox** dan mengembalikan `false` — sehingga penghapusan tidak pernah dijalankan meski klik sudah masuk.

**Solusi:** mengganti `window.confirm` / `window.alert` dengan **dialog kustom dalam-aplikasi** (`appConfirm` / `appAlert`):

- Kartu konfirmasi terpusat dengan *backdrop blur*, tombol **Batal** + **Hapus** (merah), warna aksen menyesuaikan mode.
- Andal di lingkungan apa pun (preview iframe, sandbox, webview).
- Diterapkan ke **semua** aksi hapus & validasi: hapus anggaran, hapus tujuan, hapus transaksi (2 titik), hapus aset (2 titik), dan seluruh pesan validasi form.
- Penjaga `if(!budgets[i]) return;` (dst.) ditambahkan agar tidak error bila index sudah tidak ada.

**Verifikasi** (klik tap sungguhan, dialog native sengaja diblokir untuk meniru preview): ketuk hapus → dialog muncul → "Hapus" menghapus kategori (6 → 5, ter-*recalc*); "Batal" mempertahankan (5 → 5); NO ERRORS.

---

## Turn 16 — 30 Juni 2026

### 1. Ikon tong sampah di Anggaran & Alert bisa diketuk ✅
Tombol hapus (`.fund-del`) pada tiap kartu pagu kategori didesain ulang menjadi **tombol persegi-bulat 32×32px** dengan latar lembut, area sentuh lebih lega, `touch-action:manipulation`, dan `z-index` agar tidak tertutup elemen lain. Ketuk → konfirmasi → kategori dihapus dan kartu/beranda ter-*recalc* otomatis (handler `data-del-budget` sudah aktif).

### 2. Tombol "+ Tambah" didesain ulang ✅
Dari teks polos (`.chip-link`) menjadi **tombol pil modern** (`.add-btn`): latar warna aksen mode (biru/terakota), ikon plus dalam lingkaran semi-transparan, *soft shadow* + *inset highlight*, efek *hover/active* halus. Lebih menonjol dan konsisten dengan gaya premium ATUR.

---

## Turn 15 — 30 Juni 2026

### 1. FAB Mengambang di Catatan Arus Kas ✅
Ditambahkan tombol *floating* bulat di pojok kanan-bawah layar Catatan Arus Kas, **persis seperti di Beranda**. Saat diketuk, muncul dua opsi:

- **Input Manual** → membuka form tambah transaksi.
- **Unggah e-Statement** → membuka layar pilih PDF (OCR + kategori otomatis).

Tombol *back* mengembalikan ke Catatan; setelah simpan transaksi otomatis kembali ke daftar Catatan.

### 2. Tombol "Semua >" di Tujuan Keuangan dihapus ✅
Chip "Semua >" pada kartu Tujuan Keuangan beranda dihilangkan. Kartu tujuan tetap bisa diketuk untuk membuka detailnya.

### 3. Aset di Sumber Kekayaan bisa diedit & dihapus ✅
- Ketuk baris aset mana pun → membuka form **Edit Aset** (ubah jenis, nilai, keterangan; preview nilai *realtime*; tombol **Simpan Perubahan**).
- Tiap baris punya ikon **hapus** untuk menghapus aset (dengan konfirmasi).
- Setelah edit/hapus, komposisi & persentase kekayaan otomatis dihitung ulang.

### Perbaikan bug
- Race-condition pada navigasi cepat (`closeScreen`) — layar tidak lagi terhapus saat dibuka-tutup cepat dalam 360ms.

---

## Hasil Full Audit

Seluruh navigasi & tombol di **18 layar** diuji otomatis (Playwright) — **lolos tanpa error**.

| Area | Status |
|---|---|
| Toggle mode (Saving / Bisnis) | OK |
| 5 kartu beranda | OK |
| Kartu tujuan → detail → ke jadwal biaya | OK |
| Anggaran: tambah & hapus (kartu beranda tersinkron) | OK |
| Tambah kategori inline (form FAB & edit transaksi) | OK |
| Edit + simpan transaksi | OK |
| Detail tujuan tersinkron dengan jadwal biaya | OK |
| FAB Catatan: manual / e-statement | OK |
| Edit & hapus aset di Sumber Kekayaan | OK |

### Catatan verifikasi
- Anggaran: kartu beranda tersinkron (Rp 11jt → Rp 8,7jt setelah hapus).
- Edit aset pertama → Rp 123jt, persentase ter-*recalc* otomatis.
- `semuaChipGone = true`, 2 kartu tujuan tetap *clickable*.
- Sintaks JS valid.

---

## Catatan teknis

- Single-file HTML, ikon SVG inline, render via *template literal* JS, tanpa pustaka eksternal.
- Navigasi *sub-screen overlay*: `screenStack` + `navTo` / `openScreen` / `goBack` / `closeScreen` / `renderTop`.
- Mode: `.mode-s` (biru `#2563EB`) / `.mode-b` (terakota `#C2410C`).
- Catatan dibuka via `#heroToCatatan` → `openScreen(scrCatatan())`.

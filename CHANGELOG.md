# ATUR — Catatan Perubahan

> Prototipe dashboard fintech premium Indonesia (single-file HTML).
> Berkas utama: `atur.html`
> **Versi saat ini: v1.9.6** (Turn 74 — 1 Juli 2026)

Penomoran mengikuti [Semantic Versioning](https://semver.org/lang/id/): `MAYOR.MINOR.PATCH`.

---

## v1.9.6 — Turn 74 — 1 Juli 2026

### Rapikan UI: Input Transaksi lebih ringkas, frame kalender filter, & halaman Tambah Aset 🎨

1. **Input Transaksi — lebih ringkas & chip jenis lebih rapi.**
   - Jarak antar-kolom dipadatkan (`.form-grp` di dalam pane input: `14px` → `11px`; `cur-hint` kosong tak lagi menyisakan ruang).
   - Chip **Pengeluaran / Pemasukan / Transfer** dirapikan: padding lebih pas (`11px` → `9px 6px`), ukuran ikon diseragamkan (`14px`), teks `nowrap` + `line-height:1` agar tidak melipat dan tinggi ketiga chip selalu sama, ditambah transisi warna halus. Duplikat aturan `.add-dir` yang lama juga dihapus.

2. **Bug diperbaiki — frame kalender pada filter tanggal Catatan Arus Kas.**
   - Kolom "Dari tanggal" & "Sampai tanggal" (`<input type="date">`) sebelumnya menyisakan **ruang putih berlebih** karena tinggi/padding bawaan WebKit tidak terkendali. Kini tinggi field dikunci (`height:38px`, `box-sizing:border-box`) dan bagian dalam picker dinormalkan (`::-webkit-datetime-edit`, `::-webkit-date-and-time-value`, `::-webkit-calendar-picker-indicator`) sehingga teks tanggal rata kiri tanpa celah kosong.

3. **Halaman Tambah Aset dirapikan.**
   - **Kolom Bunga diperpendek:** input `%/th` tidak lagi selebar layar (kini `width:120px`, maks `48%`) — sesuai sifatnya yang hanya angka. Diterapkan juga di layar Edit Aset agar konsisten.
   - **Keterangan "Kurs hanya estimasi untuk demo…" dihapus** dari halaman Tambah Aset sesuai permintaan.

**Verifikasi:** `node --check` lolos. Perubahan murni di lapisan CSS/markup tampilan; tidak ada perubahan logika data.

---

## v1.9.5 — Turn 73 — 1 Juli 2026

### Format ribuan (titik) seragam di SEMUA input nominal manual — `x.xxx.xxx` saat mengetik 🔢

1. **Masalah:** Tampilan saldo/nominal di seluruh aplikasi sudah memakai pemisah ribuan bergaya Indonesia (titik, mis. `Rp 1.250.000`), **tetapi saat pengguna mengetik nominal secara manual** kolom inputnya polos tanpa titik (`1250000`). Tidak konsisten dan menyulitkan membaca angka panjang.

2. **Solusi — satu sumber kebenaran, dipakai di semua kolom.**
   - Ditambahkan dua helper level-modul: `fmtThousand(str)` (mengubah teks → `x.xxx.xxx` ala `id-ID`) dan `attachThousandFmt(inp)` (memasang auto-format **live** saat mengetik, sambil **menjaga posisi kursor** agar tidak meloncat ke akhir ketika titik bertambah). `attachThousandFmt` idempoten (`dataset.thFmt`) dan aman terhadap `null`.
   - Semua kolom nominal manual diubah dari `type="number"` → `type="text" inputmode="numeric"` (wajib, karena `type=number` tidak bisa menampilkan titik) lalu dipasangi formatter: **form catat manual** (`#f-amt`), **edit transaksi** (`#e-amt`), **tambah & edit aset** (`#a-amt`, `#ae-amt`), **biaya terjadwal** (`#sc-amt`), **pagu anggaran** (`#b-cap`), **baris pos tetap rasio** (`.ap-amt`), **item target tujuan** (`.ng-it-amt`), serta **kolom Jumlah pada Tinjau AI** (`.imp-amt-in`) kini ikut format live (sebelumnya hanya saat blur).

3. **Backend tetap bersih.** Nilai yang disimpan tetap **angka murni** tanpa titik — semua handler simpan/validasi/hitung dialihkan ke `manualParse()` (mis. `+amt` → `manualParse(...)` pada `#f-amt`, `#e-amt`, `#a-amt`, `#ae-amt`, `#b-cap`, `.ng-it-amt`). Tidak ada perubahan format penyimpanan; hanya lapisan tampilan input.

4. **Verifikasi.** `node --check` lolos; stress test format baru `fmtThousand`/`manualParse` round-trip + `attachThousandFmt` (3/3 lolos); regresi parser (`stress3`) tetap **11/11 lolos**.

---

## v1.9.4 — Turn 72 — 1 Juli 2026

### Tinjau menyeluruh + stress test: pengerasan parser, hapus redundansi, fitur Kunci API AI tersambung lagi 🧪🧹🔗

1. **Stress test parser (jalur paling rawan, mengolah teks PDF/e-statement).**
   - **Cakupan:** `localParse`, `parseJagoText`, `jagoSampleParse`, `detectBankName`, `detectTransfer`, `normalizeCat`, `normalizeSub`, `pocketToCat`, `manualParse`, `curRate`, `aiDateInRange`, `aiSortedDates` diuji dengan masukan ekstrem: `null`/`undefined`/string kosong/spasi saja, angka & objek non-string, nominal rusak, tanggal hilang, teks bukan-Jago, emoji, dan string sangat panjang.
   - **Hasil:** Ditemukan 3 fungsi yang bisa melempar `TypeError` bila diberi argumen **non-string** (`localParse`, `normalizeSub`, `pocketToCat`). Walau di alur nyata aplikasi argumennya selalu string (nilai `<select>`/teks PDF), ketiganya diperkeras dengan koersi string defensif (`String(x==null?'':x)`). Setelah perbaikan: **seluruh stress test lolos tanpa pengecualian**.

2. **Hapus redundansi tanpa menghilangkan fitur/seksi.**
   - **Builder dropdown ganda dihapus:** Logika pembangun `<option>` Kategori/Sub-kategori di Tinjau AI sebelumnya **diduplikasi** — satu salinan di `scrImport()` (`catOptsFor`/`subOptsFor`) dan satu lagi di `renderTop()` (`catOptsLocal`/`subOptsLocal`). Kini disatukan menjadi **dua helper level-modul** `catOptsHTML`/`subOptsHTML` yang dipakai bersama kedua jalur. Selain menghapus duplikasi, ini sekaligus menghilangkan akar masalah *scope* yang dulu memicu bug "+ Tambah lainnya" (Turn 71).
   - **Konstanta mati `APP_VERSION` dihapus:** Tidak pernah dirujuk di mana pun; versi sudah punya satu sumber kebenaran di `<meta name="app-version">` dan `package.json`.
   - **Variabel mati `aiState` dihidupkan kembali:** Sebelumnya dihitung di `scrProfile()` tetapi tak dipakai.

3. **Fitur "Kunci API AI" tersambung kembali (tidak dihapus).**
   - **Masalah:** Layar `scrAiKey()` (mengatur kunci API AI sendiri, opsional) masih ada lengkap dengan rute `data-go="aikey"` dan tombol Simpan/Hapus yang berfungsi, **tetapi tidak punya pintu masuk** setelah perampingan kartu Profil di v1.9.2 — fitur jadi yatim (tak bisa diakses).
   - **Solusi:** Ditambahkan grup **"Lanjutan"** di **Profil & Pengaturan** dengan baris **Kunci API AI** yang menampilkan status aktif (`Aktif (server)` / `Aktif (kunci sendiri)`), memakai kembali `aiState`. Fitur kini bisa diakses lagi, dan rute yang tadinya mati menjadi hidup — redundansi rute teratasi dengan **mengaktifkan**, bukan menghapus.

4. **Validasi.** Sintaks `atur.html` lolos `node --check`; salinan `deploy/public/index.html` disinkronkan & divalidasi ulang; seluruh stress test (data layer, parser, alur taksonomi end-to-end) hijau.

---

## v1.9.3 — Turn 71 — 30 Juni 2026

### Perbaikan bug "+ Tambah lainnya" yang hilang + persiapan Koneksi Berdua via Supabase 🐛➕🔗

1. **Bug diperbaiki: memilih "+ Tambah lainnya" di Tinjau AI tidak menyimpan taksonomi baru ("hilang begitu saja").**
   - **Masalah:** Di layar **Tinjau Hasil AI**, saat memilih `+ Tambah lainnya…` lalu mengetik nama kategori/sub-kategori baru, taksonomi tidak tersimpan dan kolom teks lenyap tanpa hasil — kategori baru tidak menjadi pilihan default pada transaksi tersebut.
   - **Akar masalah (2 penyebab):**
     - **(a) Salah scope (utama):** Handler `change` untuk `.imp-cat`/`.imp-sub` berada di dalam `renderTop()`, tetapi memanggil `catOptsFor`/`subOptsFor` yang merupakan *closure lokal* di dalam `scrImport()` — di luar jangkauan. Akibatnya terjadi `ReferenceError` saat commit sehingga taksonomi baru diam-diam hilang.
     - **(b) Blur terlalu dini:** `inlineAddSelect` otomatis membatalkan input saat blur sekalipun kolom masih kosong, sehingga kolom teks bisa tertutup sebelum pengguna sempat mengetik.
   - **Solusi:**
     - Handler `.imp-cat`/`.imp-sub` kini membangun opsi dropdown **secara lokal** memakai helper level-modul (`taxFor`, `taxonomy`, `catLabel`, `subLabel`) — tidak lagi bergantung pada closure `scrImport()`. Setelah commit, kategori/sub baru langsung di-`addTaxoCat()`/ditambah ke `taxonomy`, disetel sebagai nilai terpilih pada baris itu, dan dropdown sub ikut diperbarui.
     - `inlineAddSelect` tidak lagi auto-batal saat kosong; blur hanya menyimpan bila sudah ada teks, jika kosong kolom dibiarkan terbuka.
   - **Hasil:** Memilih `+ Tambah lainnya` lalu mengetik kini benar-benar membuat taksonomi baru, menyimpannya pada transaksi tersebut, dan menjadikannya nilai default/terpilih — baik di Tinjau AI maupun input transaksi manual.

2. **Persiapan "Koneksi Berdua via Supabase" — skema SQL final + mockup layar koneksi.**
   - **Konteks:** Mengikuti keputusan memakai versi Supabase paling sederhana (tanpa akun Meta/WhatsApp Business; undangan dibagikan lewat tautan/WhatsApp biasa; Free tier cukup).
   - **Dikerjakan:**
     - **`supabase/schema.sql`** — skema final disesuaikan struktur data ATUR: tabel `households`, `household_members`, `transactions` (dengan `member_id`, `is_shared`, `mode` s/b), `assets` (terpisah per mode), dan `invites`. Dilengkapi indeks, trigger `updated_at`, Realtime, serta **RLS berbasis household** yang diperketat: mode Sendiri privat per-user, mode Berdua dibagikan antar anggota household — tidak lagi sekadar "siapa pun yang login".
     - **`supabase/koneksi-mockup.html`** — mockup statis layar **Koneksi Berdua** dengan 3 keadaan: (1) belum login, (2) sudah login tapi belum tersambung (undang via tautan), (3) sudah tersambung. Ikon WhatsApp diturunkan menjadi salah satu tombol *share* biasa (di samping Salin tautan & Bagikan…), bukan kanal utama.
   - **Hasil:** Pengguna bisa meninjau skema database & tampilan layar koneksi baru sebelum benar-benar menyambungkan Supabase. Integrasi ke `atur.html` menyusul pada rilis berikutnya.

---

## v1.9.2 — Turn 70 — 30 Juni 2026

### Opsi "+ Tambah lainnya" pada kategori/sub Tinjau AI & perampingan kartu Profil ➕🧹

1. **Tinjau Hasil AI: dropdown Kategori & Sub-kategori kini punya opsi "+ Tambah lainnya…" yang berubah jadi kolom teks.**
   - **Masalah:** Saat meninjau hasil AI, kategori/sub-kategori hanya bisa dipilih dari daftar yang ada — tidak bisa menambah nama baru langsung di tempat.
   - **Solusi:** Kedua dropdown diberi opsi `+ Tambah lainnya…`. Saat dipilih, dropdown otomatis berubah menjadi kolom teks (memakai `inlineAddSelect`) untuk mengetik nama baru; kategori baru disimpan via `addTaxoCat()` agar sinkron ke seluruh aplikasi, sub-kategori baru ditambahkan ke `taxonomy` kategori terkait. Membatalkan input mengembalikan pilihan semula.
   - **Hasil:** Pengguna bisa membuat kategori/sub-kategori baru langsung dari layar Tinjau AI tanpa keluar layar, dan nama baru langsung tersedia di semua dropdown lain.

2. **Profil & Pengaturan dirampingkan — empat kartu dihapus.**
   - **Masalah:** Kartu "Kunci API AI", "Mata Uang & Format", "Keamanan & PIN", dan "Notifikasi" memenuhi halaman padahal belum berfungsi/diperlukan untuk pengguna.
   - **Solusi:** Grup "Kecerdasan AI" (Kunci API AI) dan seluruh grup "Preferensi" (Notifikasi, Keamanan & PIN, Mata Uang & Format) dihapus dari `scrProfile()`.
   - **Hasil:** Halaman Profil & Pengaturan kini lebih ringkas — hanya menyisakan Akun (Edit Profil, Koneksi Berdua), Uang (Anggaran & Alert), dan Reset Data & Keluar.

---

## v1.9.1 — Turn 69 — 30 Juni 2026

### Sumber Kekayaan terpisah per mode, perbaikan bar kontribusi "nyangkut", & saringan periode tanggal di Tinjau AI 🏦🔀📆

1. **Sumber Kekayaan kini terpisah antara Atur Sendiri & Atur Berdua.**
   - **Masalah:** Daftar aset (`assets`) memakai satu penyimpanan global, sehingga aset yang ditambahkan di mode Berdua ikut muncul di mode Sendiri (dan sebaliknya) — padahal keuangan pribadi dan keuangan bersama seharusnya tidak tercampur.
   - **Solusi:** Penyimpanan dipisah menjadi `assetsSendiri` dan `assetsBerdua`, diakses lewat `activeAssets()` yang otomatis mengikuti `currentMode`. Semua titik baca/tulis (kartu beranda, layar Sumber Kekayaan, detail aset, tambah/edit/hapus, proyeksi bunga) dialihkan ke akses per-mode. Reset data ikut mengosongkan keduanya.
   - **Hasil:** Aset di Atur Sendiri dan Atur Berdua benar-benar terpisah; komposisi, total, dan proyeksi bunga masing-masing mode hanya menghitung asetnya sendiri.

2. **Perbaikan bug: bar kontribusi pasangan kadang muncul di "Pengeluaran per Kategori" mode Sendiri.**
   - **Masalah:** Saat berpindah dari Atur Berdua ke Atur Sendiri, `setMode()` hanya menyegarkan slot hero/duo/ledger — kartu beranda lain (Pengeluaran per Kategori, Sumber Kekayaan, Proyeksi) tidak dirender ulang, sehingga bar komposisi kontribusi (nama pasangan + persen) "nyangkut" di tampilan Sendiri padahal seharusnya hanya tampil di Berdua.
   - **Solusi:** `setMode()` kini memanggil `refreshDash()` setelah transisi, yang merender ulang seluruh dashboard dari `screenHTML(mode)` lalu memasang ulang semua handler.
   - **Hasil:** Setiap ganti mode, seluruh kartu yang bergantung mode tersegar konsisten; bar kontribusi pasangan tidak lagi bocor ke mode Sendiri.

3. **Filter tanggal di Tinjau Hasil AI diubah dari chip per-tanggal menjadi saringan PERIODE (Dari … Sampai).**
   - **Masalah:** Chip per-tanggal hanya bisa memilih satu tanggal sekaligus dan menjadi panjang/berderet saat tanggalnya banyak — kurang praktis untuk menyaring rentang.
   - **Solusi:** Diganti dua dropdown **Dari** dan **Sampai** (terurut otomatis berdasarkan urutan bulan), menampilkan hanya baris dalam rentang inklusif, lengkap hitungan transaksi pada periode dan tombol "Tampilkan semua". `Dari` dan `Sampai` otomatis ditukar bila terbalik.
   - **Hasil:** Menyaring rentang tanggal jadi lebih mudah dan ringkas; baris tinjau tetap dapat diedit/dipilih seperti biasa di dalam periode terpilih.

---

## v1.9.0 — Turn 68 — 30 Juni 2026

### Filter tanggal di Tinjau AI, pagu harian ikut waktu nyata, proyeksi kekayaan berbunga, kategori baru, & mood menabung romantis 📅💸💞

**1. Tinjau Hasil AI — filter tanggal horizontal + tampilan lebih ringkas.**
**Masalah:** halaman tinjau boros ruang (tiap transaksi kartu besar) dan sulit menavigasi banyak tanggal.
**Solusi:** ditambah **chip filter per-tanggal horizontal** (`.imp-datebar`/`.imp-datechip`, lengkap dengan hitungan transaksi tiap tanggal + chip "Semua") di atas daftar; ketuk chip menyaring baris ke tanggal itu (`aiDateFilter`). Kartu transaksi dirapatkan (padding & ikon ringkasan dikecilkan) agar lebih banyak terlihat sekali layar. Bila filter kosong, muncul pesan ramah.
**Hasil:** navigasi per tanggal sekali ketuk, halaman jauh lebih ringkas, indeks baris tetap stabil sehingga edit/pilih/buang tetap akurat.

**2. Pagu Harian ikut waktu nyata — bulan lampau = selesai.**
**Masalah:** sisa hari tidak peka konteks; bulan yang sudah lewat tetap membagi sisa pagu seolah masih berjalan.
**Solusi:** logika sisa hari di `budgetCardInner()` dibuat tiga keadaan: **bulan lampau → 0** (kartu menampilkan sisa total dengan label "bulan selesai", tanpa pembagian harian), **bulan berjalan → sisa hari nyata** sampai akhir bulan dari tanggal hari ini, **bulan depan → jumlah hari penuh**.
**Hasil:** angka "sisa per hari" selalu masuk akal dan jujur terhadap kalender berjalan.

**3. Dropdown "Tambah anggaran kategori" — pengeluaran saja + opsi nama baru.**
**Masalah:** dropdown pagu menampilkan seluruh taksonomi (termasuk pemasukan/transfer) dan tak bisa membuat kategori sendiri.
**Solusi:** `scrBudgetNew()` kini hanya memuat kategori **pengeluaran** (`taxFor('out')`) + opsi **"+ Tambah kategori…"** yang memunculkan input nama; nama baru ditambahkan ke taksonomi pengeluaran lewat `addTaxoCat('out', nama)` sehingga otomatis tersinkron ke seluruh aplikasi (Arus Kas, e-Statement).
**Hasil:** anggaran fokus ke pengeluaran, dan kategori buatan user langsung dipakai di mana saja.

**4. Sumber Kekayaan — bunga %/tahun + proyeksi berbunga majemuk dengan grafik & slider.**
**Masalah:** aset hanya menunjukkan nominal sekarang, tanpa gambaran pertumbuhan.
**Solusi:** form tambah & edit aset diberi kolom **opsional "Bunga / imbal hasil per tahun (%)"**. Kartu Sumber Kekayaan di beranda kini menampilkan **nominal sekarang** + **proyeksi 1–5 tahun** via **slider tahun** dan **grafik batang** (`.wealth-proj`), memakai bunga majemuk per instrumen (`assetFuture`/`wealthProjTotal`). Detail aset menampilkan **proyeksi kenaikan per tahun** (`assetProjRows`, tahun 1–5 + selisih).
**Hasil:** user melihat estimasi pertumbuhan kekayaan ke depan, per aset maupun total.

**5. Kategori transfer baru "Tabungan Terjadwal" (Tahunan/Liburan) + penamaan dana disinkronkan.**
**Masalah:** belum ada kategori transfer khusus tabungan terjadwal; istilah "Annual Fund/Holiday Fund" masih Inggris dan terpisah dari Tujuan Keuangan.
**Solusi:** ditambah kategori transfer **"Tabungan Terjadwal"** dengan sub **Tahunan** & **Liburan**. Seluruh tampilan **Annual Fund → Tabungan Tahunan**, **Holiday Fund → Tabungan Liburan** (di Target Setoran per Bulan, Tujuan Keuangan, dll.) lewat lapisan label; `goalCollected()` mencocokkan kategori baru **dan** data lama. **Kunci data internal tetap stabil** (`annual`/`holiday`/`Setor Tabungan`) agar data lama & parser AI utuh.
**Hasil:** setoran via "Tabungan Terjadwal › Tahunan/Liburan" otomatis sinkron dengan Tujuan Keuangan & target setoran — label berubah, data tidak rusak.

**6. Komposisi kontribusi user vs pasangan dipindah ke beranda (ringkas).**
**Masalah:** komposisi kontribusi rumah tangga terlalu jauh/tersebar.
**Solusi:** di beranda mode Berdua, kartu **Pengeluaran per Kategori** kini memuat **satu bar** + **dua label nama** dengan **persen** (`.khc-contrib`) — ringkas, tidak wordy.
**Hasil:** sekilas terlihat siapa berkontribusi berapa, langsung di beranda.

**7. Mood menabung dipindah ke beranda dengan wajah emoji lucu & romantis.**
**Masalah:** penanda mood ("Yuk mulai sisihkan") berada di Atur Proyeksi Tahunan, jauh dari konteks proyeksi tabungan beranda.
**Solusi:** kartu mood dihapus dari `scrRasio()` dan dijadikan **penanda di dalam kartu "Proyeksi Tabungan Setahun"** beranda (`savingMoodCardHTML`/`.mood-marker`). Wajah `SAVE_FACES` diganti jadi **lucu & romantis** (pipi merona, mata hati, wajah ciuman mengirim hati) yang naik level seiring tabungan tahunan tumbuh.
**Hasil:** dorongan emosional untuk menabung berada tepat di tempat yang relevan, dengan nuansa hangat untuk pasangan.

**8. Mode Berdua — Pengeluaran per Kategori dengan toggle user/pasangan + daftar transaksi per orang.**
**Masalah:** halaman terlalu padat dan sulit melihat transaksi tiap orang.
**Solusi:** `scrKategoriBerdua()` disederhanakan + **toggle user ⇄ pasangan** (`.kbp-toggle`, state `kbPicTab`). Tiap section menampilkan **kumpulan transaksi orang tersebut** (pengeluaran bulan fokus, dari `curMonthTxns()` + `txnPic()`), dan **tiap baris tappable membuka editor Catatan Arus Kas** (`data-edit-txn`) sehingga benar-benar sinkron.
**Hasil:** transaksi per orang transparan, ringkas, dan satu sumber kebenaran dengan Catatan Arus Kas.

> Catatan internal: slot PIC `reza`/`dini` tetap dipakai sebagai **kunci slot** (slot1=user, slot2=pasangan) dan **tidak pernah tampil di layar** — tampilan selalu lewat `myName()`/`partnerDisplay()`.

## v1.8.0 — Turn 67 — 30 Juni 2026

### Pagu harian, proyeksi tabungan bisa minus, kategori Berdua sinkron, & seluruh penamaan jadi Bahasa Indonesia 🇮🇩📊

**1. Pagu Harian di beranda (Sendiri & Berdua).**
**Masalah:** user tidak punya gambaran "boleh habis berapa per hari" dari tiap pagu kategori — hanya ada total pemakaian bulan.
**Solusi:** ditambah **carousel "Pagu Harian"** di kartu *Anggaran Bulan Ini*, **di bawah bar total**. Kartu mini geser-ke-kanan (`.ph-strip`/`.ph-card`, hemat ruang, gaya seperti *Tujuan Keuangan*) menampilkan **sisa uang per hari** = (pagu − terpakai) ÷ sisa hari bulan ini, bar pemakaian, dan sisa pagu. Sisa hari dihitung dari tanggal berjalan bila bulan fokus = bulan berjalan, selain itu pakai jumlah hari penuh bulan tersebut.
**Hasil:** saat **lewat pagu**, kartu tampil **merah** dan angka per hari ditulis **minus** (mis. `− Rp 50.000`), bukan dipaksa Rp 0 — jujur menunjukkan defisit.

**2. Proyeksi Tabungan Setahun bisa minus + bar jadi merah (Sendiri & Berdua).**
**Masalah:** bila proyeksi pengeluaran non-reguler melebihi akumulasi tabungan, nilai dipaksa ke Rp 0 — menyembunyikan bahwa tabungan tahunan sebenarnya **tergerus jadi minus**.
**Solusi:** `annualProj()` tidak lagi *clamp* `netSaving` (boleh negatif) + flag `deficit`. Di kartu beranda (`#sec-proj`) dan layar Biaya Tahunan, nilai kini tampil `− Rp …` dan **bar tabungan berubah merah** (`.apc-fill.save.deficit` / gradien merah) saat defisit; badge berubah jadi "Defisit". Kedua bar (tabungan vs pengeluaran non-reguler) tetap sinkron dengan satu sumber `annualProj()`.
**Hasil:** user langsung sadar kalau rencana tahunannya menombok.

**3. Mode Berdua — arus kas & kategori benar-benar sinkron dengan data user.**
**Masalah:** hero Berdua membaca `familySeries()` (sumber kosong) sementara grafik membaca `monthSeries()` (data aktif) → angka & grafik tak cocok. "Pengeluaran per Kategori" Berdua juga memakai taksonomi pagu rumah tangga buatan (`CAT_TO_BUDGET`) yang tak 1:1 dengan transaksi, plus ada edit pagu inline yang membingungkan.
**Solusi:** hero Berdua disatukan ke `monthSeries()` (baca `activeTxns` → input manual + e-statement). `deriveAll()` kini menghasilkan `byDonutPic` (pengeluaran per kategori donut **per orang**). `scrKategoriBerdua()` ditulis ulang: kategori 1:1 dengan transaksi (nama donut Indonesia), persen terhadap rumah tangga, dan **split per orang**. Bar **"Kontribusi pengeluaran bersama"** dipindah dari hero **ke dalam** kartu Pengeluaran per Kategori. Edit "pagu bulanan + Simpan" inline beserta handler matinya (`toggleHhEdit`/`saveHh`/`.pic-pick`) dihapus.
**Hasil:** nominal hero, grafik, daftar per-orang, dan kategori semua menampilkan **angka yang sama** dari data yang user masukkan.

**4. Seluruh taksonomi, kategori & sub-kategori jadi Bahasa Indonesia.**
**Masalah:** label kategori/sub-kategori masih campur Inggris — kurang ramah untuk user awam.
**Solusi:** ditambah **lapisan label** `CAT_LABEL_ID`/`SUB_LABEL_ID` + fungsi `catLabel()`/`subLabel()`. **Kunci data tetap stabil** (untuk keutuhan data tersimpan & parser AI), hanya **teks tampilan** yang diterjemahkan di semua titik: baris transaksi, ledger, arus kas, layar edit, tambah pagu, tinjau AI, dana, dan dropdown dinamis.
**Hasil:** 100% tampilan Bahasa Indonesia tanpa merusak data lama maupun integrasi AI.

> Catatan internal: slot PIC `reza`/`dini` tetap dipakai sebagai **kunci slot** (slot1=user, slot2=pasangan) dan **tidak pernah tampil di layar** — tampilan selalu lewat `myName()`/`partnerDisplay()` sesuai input nama user & pasangan.

## v1.7.0 — Turn 66 — 30 Juni 2026

### Hapus banyak transaksi sekaligus (bulk delete) dengan seret jari — di Arus Kas & Tinjau Hasil AI 🗑️

**Masalah:** menghapus transaksi hanya bisa **satu per satu** (tombol 🗑️ tiap baris). Untuk data banyak — mis. hasil impor e-statement yang bisa ratusan baris — ini melelahkan. Pemilik minta cara yang lebih cepat & tidak membuat layar terasa penuh, idealnya cukup **menyeret jari ke bawah** melewati beberapa baris agar langsung terpilih.

**Solusi (gabungan Opsi 1 *drag-to-select* + Opsi 3 *pilih-semua-yang-tampil*):**

**1. Mode pilih yang bersih.** Ditambah tombol kecil **"Pilih"** di bar atas daftar. Saat ditekan → masuk **mode pilih**: muncul **lingkaran centang** (`.selck`) di kiri tiap baris. Di pemakaian normal tak ada elemen tambahan, jadi layar tetap lega. Saat mode pilih aktif, tombol hapus per-baris & tombol **+ (FAB)** disembunyikan agar tidak membingungkan.

**2. Drag-to-select (seret jari).** Ketuk satu baris lalu **seret ke bawah/atas** → semua baris yang dilewati ikut tercentang otomatis (memakai `pointerdown`/`pointermove`/`pointerup` + `document.elementFromPoint`, jalan di sentuh HP maupun klik-seret desktop). Ketuk tunggal tetap bisa toggle satu baris.

**3. Bar aksi melayang di bawah** (`.selbar-bot`, `position:fixed`): menampilkan "**N dipilih**", tombol **"Pilih semua tampil"** (menghormati filter bank/arah/rentang tanggal yang sedang aktif — inilah Opsi 3), dan tombol **"Hapus (N)"** merah. Sebelum menghapus selalu ada **konfirmasi** (`appConfirm`).

**4. Dua tempat, dua makna jelas:**
   - **Arus Kas (Catatan Arus Kas):** "Hapus (N)" → menghapus transaksi **permanen** dari store aktif (lewat `activeTxns()`/`saveActiveTxns()`, jadi jalan di mode **Sendiri & Berdua**). "Pilih semua tampil" hanya memilih baris yang sedang terlihat sesuai filter, sehingga tak ada yang salah terhapus di luar layar.
   - **Tinjau Hasil AI (sebelum simpan):** tombolnya **"Buang (N)"** → hanya **membuang baris dari daftar tinjau** (`aiParsePreview`), bukan menghapus data; tombol "Simpan N Transaksi" otomatis menyesuaikan jumlahnya. Mode pilih di-reset tiap parsing PDF baru.

**State baru:** `catatanSelMode`/`catatanSelected` (Arus Kas) dan `impSelMode`/`impSelected` (Tinjau AI). **CSS baru:** `.sel-btn`, `.selbar-top`, `.selck`, `.cf-txn.picked`/`.imp-card.picked`, `.selbar-bot` (+ `.sb-count`/`.sb-all`/`.sb-del`) — semuanya mode-aware (biru Sendiri / terakota Berdua via `var(--accent)`).

**Yang TIDAK diubah:** perhitungan (`txnIDR`, total, donat, pagu), taksonomi per-jenis, multi-mata-uang, deteksi transfer otomatis, serta tombol hapus & edit satu-satuan yang lama (tetap berfungsi saat mode pilih nonaktif).

**Validasi:** sintaks JS lolos `node --check`; `atur.html` ⇄ `deploy/public/index.html` disinkronkan; versi dinaikkan di `<meta app-version>`, `deploy/package.json`, dan changelog ini; `atur-deploy.zip` di-rebuild. Tidak ada server listener di sandbox.

---

## v1.6.0 — Turn 65 — 30 Juni 2026

### Tiga jenis transaksi (Pemasukan/Pengeluaran/**Transfer**) + taksonomi per-jenis yang bisa ditambah + nominal multi-mata-uang 💱

Permintaan pemilik (berlaku di **Atur Sendiri & Atur Berdua**):
> "tetap dicatat tapi masuk ke kategori transfer. Jadi ada Pengeluaran, Pemasukan dan Transfer … masing masing taxonomy aku mau dia ada opsi untuk nambah kategori … IDR, USD, SGD, EUR, JPY, AUD. Kurs default saja."

**1. Jenis transaksi ketiga — Transfer.** Field `dir` kini bernilai `'in'` / `'out'` / **`'transfer'`**. Transfer **tetap tercatat** tapi **dikecualikan** dari total Pemasukan & Pengeluaran (mis. "Tambah Uang Kantong" antar-kantong, top-up e-wallet, setor/tarik tabungan). Layar Catatan kini menampilkan **3 angka** (Pemasukan · Pengeluaran · Transfer) dengan kotak Transfer berwarna indigo. Tombol arah di form Tambah, Edit, dan Tinjau-Impor kini 3 pilihan.

**2. Taksonomi per-jenis + bisa nambah kategori.** Kategori kini dikelompokkan per jenis lewat `TAXO_BY_DIR` (out/in/transfer); ganti jenis → daftar kategori ikut menyesuaikan. Setiap jenis punya opsi **"+ Tambah kategori"** (lewat `addTaxoCat(dir,name)`). Data lama dipetakan otomatis (`Revenue→Salary`, `Investment→Investment Return`, `Annual/Holiday Fund→Setor Tabungan`, `Lainnya→Other Expense`) via `CAT_MIGRATE`/`migrateCat`/`normalizeCat`.

**3. Nominal multi-mata-uang (kurs default).** Dropdown mata uang **IDR · USD · SGD · EUR · JPY · AUD** di form Tambah & Edit. Tiap transaksi simpan `cur` + `rate` (kurs default bawaan via `CURRENCIES`/`curRate`). Semua agregasi (total bulanan, saldo, rasio, donat, per-bank) dihitung dalam IDR lewat `txnIDR()`, tapi tampilan baris tetap menunjukkan nilai mata uang asli + ekuivalen Rp.

**Deteksi transfer otomatis di impor & demo.** `detectTransfer()` menandai "Tambah Uang Kantong / Pindah uang antar Kantong" → Antar Kantong, "Isi Saldo E-Wallet" → Top-up E-Wallet, "Setor/Tarik Uang Kantong" → Setor/Tarik Tabungan. Diterapkan di `parseJagoText`, `shapeAiTxns`, dan fixture demo `jagoSampleParse`. Bunga = pemasukan riil, Pajak Bunga = pengeluaran riil (tetap dihitung).

**Validasi:** sintaks JS lolos `node --check`. CSS baru ditambah (`.stat-grid-3`, `.sv.trf`, `.dir-opt.on.transfer`, `.dir-toggle-3`/`.add-dir-3`/`.imp-dirtoggle-3`, `.amt-row`, `.cur-sel`, `.cur-hint`, `.cf-dir.trf`, `.cf-amt.trf`, `.imp-sum-dir.trf`, `.imp-sum-amt.trf`, `.imp-dirbtn.on.trf`). Tidak ada server listener di sandbox.

---

## v1.5.2 — Turn 64 — 30 Juni 2026

### Konfirmasi alur "Upload PDF" di UI + pengurai cadangan PDF Bank Jago diperkuat 📄

Permintaan pemilik: di UI, user **tetap upload PDF** (karena e-statement bank umumnya PDF, bukan Excel); semua analisa terjadi **di backend** dan tak terlihat user.

- **UI sudah benar (dikonfirmasi):** layar "Unggah e-Statement" memakai input `accept="application/pdf"` + tombol "Pilih PDF". Alur untuk user: pilih PDF → ekstraksi teks di browser (pdf.js; OCR Tesseract bila PDF hasil scan) → teks dikirim ke backend (`/api/parse-estatement`) → AI normalkan ke 8 kolom & kategorikan → tinjau & simpan. Tidak ada perubahan langkah yang perlu untuk memenuhi permintaan ini.
- **`parseJagoText()` ditulis ulang** (pengurai cadangan saat AI/server tak tersedia) agar **cocok dengan struktur PDF Bank Jago yang sebenarnya**: tiap blok transaksi = Tanggal · Waktu · Sumber/Tujuan (1–2 baris) · jenis transaksi (Pembayaran QRIS/Transfer/Bunga/…) · ID# · Catatan opsional · **Jumlah (tak bertanda; minus = keluar)** · **Saldo**. Aturan kunci: dua angka terakhir di blok = [Jumlah, Saldo-setelah-transaksi].
- Pengurai cadangan kini juga menghasilkan **8 kolom granular** (`source`, `detail`, `balance`, `dateFull`, `timeFull`) — seragam dengan jalur AI, sehingga hasil offline tetap kaya & konsisten.
- Komentar lama yang keliru ("teks PDF Jago tak bisa diurai di browser") dihapus — terbukti pdf.js mengekstrak teksnya bersih.

**Validasi pada PDF asli pemilik** (`dummy_e_statement_mei_2026.pdf`, Bank Jago, 12 halaman): pengurai cadangan baru berhasil membaca **126 transaksi** dari semua kantong, memetakan benar ke 8 kolom (Nama Kantong · Tanggal · Waktu · Sumber/Tujuan · Rincian · Catatan=saldo-setelah · Jumlah±  · Saldo). Sintaks JS OK. Tidak ada server listener di sandbox.

---

## v1.5.1 — Turn 62 — 30 Juni 2026

### Tahap 1 baca PDF tahan-banting (format macam-macam) + kategori prioritas dari Nama Kantong 🧩

Memperjelas & memperkuat alur 2 tahap (pilihan A: backend menerima **teks** hasil ekstraksi PDF dari browser):

**Tahap 1 — baca & normalkan PDF macam-macam → 8 kolom seragam**
- Prompt sistem dipindah ke modul tunggal `deploy/api/_estatement-prompt.js` (+ salinan `deploy/tools/estatement-prompt.js`), dipakai bersama oleh `parse-estatement.js` & `extract-excel.js` agar konsisten.
- Prompt ditulis ulang agar **eksplisit menangani format bermacam-macam** (Bank Jago, BCA, Mandiri, BNI, BRI, Jenius, dll.; berkantong maupun tidak; urutan/nama kolom berbeda): AI diminta membaca apa pun layout-nya lalu **menormalkan** ke skema seragam, mengabaikan baris non-transaksi (header, subtotal, ringkasan, footer).
- Mengenali variasi arah dana: tanda +/− **atau** kolom Debit/Kredit (DB/CR).

**Tahap 2 — implementasi ke aplikasi (Jumlah · Remarks · Pemasukan/Pengeluaran)**
- **Kategori berprioritas Nama Kantong**: aturan ditegaskan — (a) PERTAMA petakan dari nama kantong (`Food`→Food, `Groceries`→Groceries, `Holiday Fund`→Vacation, `Annual Fund`→Investment, `Self Care`→Selfcare, dst.), (b) BARU fallback tebak dari Rincian/merchant bila tak ada kantong. Di frontend sudah dijalankan via `pocketToCat()` (`shapeAiTxns` baris ~3319).
- `shapeAiTxns()` kini **meneruskan field granular** Tahap 1 ke transaksi: `source`, `detail`, `balance` (saldo setelah transaksi), `dateFull`, `timeFull` — dengan fallback rapi dari `sender` lama. Field-field ini ikut **tersimpan** saat impor (handler `imp-confirm`), sehingga tersedia untuk analisa & ekspor 8 kolom.

**Validasi:** sintaks JS OK (backend 4 berkas + frontend); uji konversi campuran (transaksi berkantong & tanpa kantong, format tanggal `DD Mon`/`DD/MM/YYYY`, waktu dengan/ tanpa detik) menghasilkan 8 kolom benar; prompt memuat aturan PRIORITAS kantong (terverifikasi). Tidak ada server listener di sandbox.

---

## v1.5.0 — Turn 61 — 30 Juni 2026

### Backend: ekstraksi e-statement → Excel 8 kolom untuk bahan analisa 📊

Menambah jalur backend yang mengubah e-statement menjadi tabel **8 kolom terstruktur** (urutan tetap), sebagai format informasi untuk menganalisa e-statement:

| # | Kolom | Isi |
|---|---|---|
| 1 | Nama Kantong | nama kantong/pocket (bila ada) |
| 2 | Tanggal Transaksi | tanggal lengkap (`dateFull`) |
| 3 | Waktu | waktu lengkap jam s/d detik (`timeFull`) |
| 4 | Sumber/Tujuan Transaksi | pengirim/penerima (`source`) |
| 5 | Rincian Transaksi | merchant + info tambahan (`detail`) |
| 6 | Catatan | **saldo SETELAH transaksi** (running balance) |
| 7 | Jumlah | nominal bertanda — **+ masuk / − keluar** |
| 8 | Saldo | **perubahan** saldo kantong = nilai Jumlah |

**Berkas baru:**
- `deploy/api/extract-excel.js` — Serverless Function `POST /api/extract-excel`: menerima teks e-statement, memanggil parser AI yang sama (kunci OpenAI RAHASIA di server), membalas `{columns, rows, csv, transactions}`. CSV berformat UTF-8+BOM (langsung dibuka di Excel/Sheets).
- `deploy/tools/estatement-columns.js` (+ salinan `deploy/api/_estatement-columns.js`) — **sumber kebenaran tunggal** skema 8 kolom + pemetaan transaksi → baris + generator CSV.
- `deploy/tools/estatement-to-excel.js` — CLI backend: `node tools/estatement-to-excel.js <input.json|-> [output]` → menulis `.csv` (selalu) dan `.xlsx` (bila paket `xlsx` terpasang).

**Perubahan parser:** prompt `parse-estatement.js` diperkaya agar AI mengeluarkan field granular yang dibutuhkan 8 kolom: `source` & `detail` terpisah, `balance` (saldo setelah transaksi), serta `dateFull` & `timeFull` (waktu lengkap sampai **detik**). Field lama (`sender`, `note`, `date`, `time`) tetap ada untuk kompatibilitas.

**Catatan desain kolom 6 vs 8:** "Catatan" = saldo setelah transaksi (dari kolom Saldo e-statement); "Saldo" = perubahan/delta berdasarkan Jumlah. Sengaja dipisah sesuai definisi yang diminta. Konverter punya fallback rapi: bila hanya ada `sender` (data lama), otomatis dipecah jadi source/detail; header 8 kolom selalu hadir meski transaksi kosong.

**Validasi:** sintaks JS OK (`node --check`) untuk keempat berkas; uji konversi 3 transaksi + data format lama + kasus kosong semuanya benar. Tidak ada server listener yang dijalankan di sandbox.

---

## v1.4.6 — Turn 60 — 30 Juni 2026

### Pagu per kategori benar-benar kosong + taksonomi penuh + chart Berdua empty-state + tujuan keuangan terpisah per mode 🧹

Tiga permintaan ditangani:

**1. Pagu per kategori (Sendiri) DEFAULT KOSONG + dropdown taksonomi lengkap**
   - Array `budgets` kini `[]` (kosong). Layar **Anggaran Bulan Ini › Pagu per Kategori** menampilkan **empty-state** ("Belum ada pagu kategori") sampai user menekan **+ Tambah**. Tidak ada lagi 6 kartu pra-isi.
   - Dropdown **"Kategori (sesuai arus kas)"** pada **Tambah Anggaran** kini menarik **taksonomi LENGKAP** (`validCats()` → ±17 kategori: Food, Groceries, Transport, Family, Housing, Utilities, Shopping, Subscription, Vacation, Investment, Revenue, Selfcare, Medical, Entertainment, Annual Fund, Holiday Fund, Lainnya) — bukan lagi hanya 6 kategori donut.
   - Pemakaian per pagu (`sendiriBudgetSpent`) kini dibaca **presisi** dari `deriveAll().byCat` (kategori taksonomi mentah) sehingga angka "terpakai" cocok persis dengan kategori di Arus Kas. Ditambah agregasi baru `byCat` di `deriveAll()`.
   - Kartu pagu tersimpan/dimuat ulang dari `atur_budget_caps` dengan rekonstruksi otomatis (warna & ikon dari tabel `TAXO_META`).

**2. Chart "Arus Kas Keluarga" (Berdua) — empty-state saat tak ada data**
   - `chartSVG()` kini mendeteksi bila **semua bulan = 0** (tak ada pemasukan/pengeluaran) dan menampilkan placeholder **"Belum ada data · Tambah transaksi untuk melihat grafik"** alih-alih batang setinggi 0. Berlaku untuk Sendiri & Berdua (keduanya dirutekan via `activeTxns()`).
   - Penegasan: data e-statement / manual Sendiri & Berdua **tetap terpisah** (store `manualTxns` vs `householdTxns` dari v1.4.5).

**3. Pengeluaran per Kategori & Tujuan Keuangan Berdua = 0 bila kosong, terpisah dari Sendiri**
   - **Pengeluaran per Kategori** Berdua sudah membaca `deriveAll().byDonut` per mode → otomatis **0** bila Berdua belum ada transaksi.
   - **Tujuan Keuangan** (Annual/Holiday Fund) + Proyeksi Non-Reguler kini **terpisah per mode**: ditambah `_projStore` yang memisahkan `goals`, `scheduledCosts`, `fixedIncome`, `fixedExpense` untuk mode `s` vs `b`. Saat `setMode()` ganti mode, isi di-`swapProjStore()`. Jadi tujuan keuangan Berdua **default 0/kosong** dan tidak ikut data Sendiri.

**Validasi:** sintaks JS OK (`node --check`); `atur.html` ⇄ `deploy/public/index.html` disinkronkan; versi dinaikkan di `<meta app-version>`, `deploy/package.json`, dan changelog ini.

---

## v1.4.5 — Turn 59 — 30 Juni 2026

### Default kosong + ATUR Berdua punya store data sendiri (tak lagi sync dengan Sendiri) 🔒

Empat permintaan ditangani sekaligus:

**1. Dropdown "Tambah Anggaran" = kategori arus kas** (lanjutan v1.4.4) — dipastikan pilihan dropdown ditarik dari `cats` (kategori Arus Kas), disaring dari yang sudah punya pagu.

**2. Pagu per kategori default KOSONG** — baik `budgets` (Sendiri) maupun `householdBudgets` (Berdua) kini `cap:0`. Kartu menampilkan *"belum diatur"* sampai user mengisi pagu sendiri lewat tombol **Ubah**. Tidak ada lagi pagu/angka demo.

**3. Annual Fund & Holiday Fund hanya terisi dari input user** — target kedua fund (`goalTgt`) murni dihitung dari `scheduledCosts`, yang **hanya bertambah** saat user menambah biaya di **Kelola biaya tahunan non-reguler**. Default kosong → target & progress = Rp 0.

**4. ATUR Berdua = STORE TERPISAH dari ATUR Sendiri** *(perubahan utama)* —
   - Ditambah store transaksi baru `householdTxns` (localStorage `atur_household_txns`), terpisah dari `manualTxns` (Sendiri).
   - Accessor `activeTxns()` / `saveActiveTxns()` mengarahkan **semua** baca-tulis transaksi ke store sesuai mode aktif. Dirutekan ulang: `curMonthTxns`, `deriveAll`/`deriveSig`, `allTxns`, `savingRatio`, `monthTotals(ForIndex)`, `curMonthKey`, `defaultTxnDate`, `goalCollected`, plus handler **tambah / edit / hapus / impor e-statement**.
   - Akibatnya transaksi yang dicatat di **Berdua tidak muncul di Sendiri**, dan sebaliknya. Keduanya **default kosong**.
   - Pagu rumah tangga (Berdua) kini bisa diatur per kategori (tombol **Ubah** di layar *Pengeluaran per Kategori*) dan disimpan **terpisah** di `atur_hh_budget_caps`. Fallback angka demo `b.spent` dihapus — pemakaian selalu dihitung dari transaksi Berdua (0 bila kosong).
   - **Reset Data** kini ikut menghapus `atur_household_txns` & `atur_hh_budget_caps`.

> Catatan: Proyeksi Tahunan (pemasukan/pengeluaran tetap & biaya non-reguler) bersifat in-memory dan tidak dipersistkan, sehingga selalu mulai kosong tiap sesi.

**Validasi:** sintaks JS OK (`node --check`); `atur.html` ⇄ `deploy/public/index.html` disinkronkan.

---

## v1.4.4 — Turn 58 — 30 Juni 2026

### Konfirmasi: dropdown "Tambah Anggaran" bersumber langsung dari kategori arus kas ✅

- Dropdown **Kategori** pada layar **Tambah Anggaran** (`scrBudgetNew`) kini dipastikan menarik pilihannya **langsung dari array `cats`** — yaitu sumber kebenaran kategori **Arus Kas** (donut): `Cicilan KPR`, `Keluarga`, `Makanan & Minuman`, `Transportasi`, `IPL & Utilitas`, `Lainnya`.
- Pilihan dibangun lewat `cats.map(c => c.nm)` dan **disaring** terhadap kategori yang sudah punya pagu (`used`), sehingga **tak ada kategori ganda** dan label dropdown **selalu identik** dengan kategori arus kas — tidak ada lagi nama bebas/menyimpang.
- Bila semua kategori arus kas sudah punya pagu, dropdown diganti catatan *"Semua kategori arus kas sudah punya pagu."*
- Karena nama kategori pagu = nama kategori arus kas, angka **terpakai** tetap selaras 1:1 (lihat v1.4.3).

> Hasil: apa pun kategori yang muncul di Arus Kas akan otomatis tersedia sebagai pilihan pagu — keduanya tak mungkin lagi berbeda.

**Validasi:** sintaks JS OK (`node --check`); `atur.html` ⇄ `deploy/public/index.html` disinkronkan.

---

## v1.4.3 — Turn 57 — 30 Juni 2026

### Selaraskan kategori pagu (anggaran) dengan kategori arus kas 🔗

**Masalah:** angka **terpakai** pada kartu pagu tidak cocok dengan total kategori yang sama di **arus kas**. Contoh: set pagu *Makanan* Rp 1 jt, tapi arus kas mencatat Rp 2 jt — angkanya tidak nyambung. Penyebabnya: daftar pagu mode **Sendiri** memakai nama kategori (`Hiburan`, `Belanja`) yang **tidak ada** di kategori arus kas (donut), sehingga keduanya dipetakan ke `Lainnya` dan terjadi tumpang-tindih / penghitungan ganda.

**Perbaikan:**
- **`budgets` (pagu Sendiri) kini persis sama dengan 6 kategori arus kas:** `Cicilan KPR`, `Keluarga`, `Makanan & Minuman`, `Transportasi`, `IPL & Utilitas`, `Lainnya`. Nama `Hiburan` & `Belanja` yang menyimpang dihapus.
- **`sendiriBudgetSpent()`** kini memakai `sendiriDonutKey(b)` yang mencocokkan nama pagu **1:1** dengan kategori arus kas (`deriveAll().byDonut`). Tersedia tabel kompatibilitas `SENDIRI_BUDGET_TO_DONUT` untuk data lama (`Hiburan`/`Belanja` → `Lainnya`). Fallback demo `b.spent` dihapus.
- **"Tambah Anggaran" (`scrBudgetNew`)** kini hanya menawarkan kategori arus kas yang **belum** punya pagu (cegah duplikat). Bila semua sudah dipakai, muncul catatan *"Semua kategori arus kas sudah punya pagu."* Kolom isian nama bebas dihapus; label menjadi **"Kategori (sesuai arus kas)"**.
- **Handler simpan (`b-save`)** memakai nama kategori arus kas langsung + warna/ikon donut yang sesuai, dengan dedup.

> Hasil: angka **terpakai** pada tiap kartu pagu = total kategori **yang sama** di arus kas. Skenario "pagu Rp 1 jt, arus kas Rp 2 jt" kini benar menampilkan kondisi **lewat pagu** (over-budget), bukan salah hitung.

**Validasi:** sintaks JS OK (`node --check`); `atur.html` ⇄ `deploy/public/index.html` disinkronkan.

---

## v1.4.2 — Turn 56 — 30 Juni 2026

### Hapus tombol "Atur anggaran" ganda di kartu Anggaran Bulan Ini 🧹

- Pada v1.4.1 empty-state kartu **Anggaran Bulan Ini** menampilkan tautan **"Atur anggaran"**, padahal header kartu sudah punya tombol **"Atur"** — jadi ada dua tombol dengan fungsi sama.
- Tautan **"Atur anggaran"** di empty-state dihapus; cukup pertahankan tombol **"Atur"** di header kartu. Teks ajakan tetap ada.

**Validasi:** sintaks JS OK (`node --check`); `atur.html` ⇄ `deploy/public/index.html` disinkronkan.

---

## v1.4.1 — Turn 55 — 30 Juni 2026

### Perbaikan kartu "Anggaran Bulan Ini" — user harus set pagu dulu 🎯

**Masalah:** kartu **Anggaran Bulan Ini** di beranda menampilkan persentase pagu yang menyesatkan ketika pengguna **belum** mengatur anggaran apa pun. Penyebabnya di `budgetCardInner()`: total pagu di-fallback ke `|| 1` (juta), sehingga `pc = totSpent / 1 × 100` menghasilkan bar terisi penuh / >100% padahal tak ada pagu yang ditetapkan.

**Perbaikan:**
- `budgetCardInner()` kini mengecek `totCap > 0` (apakah pengguna sudah menetapkan pagu untuk minimal satu kategori).
- **Bila belum ada pagu** → tampilkan empty-state: *"Belum ada pagu. Atur anggaran per kategori dulu — pemakaian akan terhitung otomatis dari arus kas."* + tautan **Atur anggaran**. Tidak ada lagi persentase semu.
- **Bila pagu sudah ada** → pemakaian dihitung otomatis dari arus kas (`deriveAll` / `sendiriBudgetSpent`), dengan label diperjelas: `Rp X terpakai · Y% dari Rp Z pagu`.
- Berlaku untuk mode **Sendiri** & **Berdua** (guard memakai baris pagu sesuai mode).
- CSS baru `.budg-empty-row` / `.budg-empty-txt`.

> Alur yang benar kini: **set anggaran → pemakaian otomatis terhitung dari arus kas**, bukan menebak persentase saat pagu kosong.

**Validasi:** sintaks JS OK (`node --check`); `atur.html` ⇄ `deploy/public/index.html` disinkronkan.

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

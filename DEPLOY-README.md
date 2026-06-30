# ATUR — Aplikasi Pencatatan Keuangan

Prototipe aplikasi **pencatatan & pelacakan** keuangan pribadi (ATUR Sendiri) dan rumah tangga/pasangan (ATUR Berdua). Seluruh aplikasi adalah **satu file HTML statis** (`index.html`) — tanpa backend, tanpa build step, tanpa dependensi runtime. Data tersimpan lokal di browser (localStorage).

> Catatan: ATUR adalah aplikasi **pencatatan**, bukan aplikasi perbankan. Tidak ada perpindahan uang nyata maupun saldo virtual; semua angka dihitung dari transaksi yang dicatat pengguna.

## Struktur

```
index.html           # seluruh aplikasi (HTML + CSS + JS inline) — di akar repo
api/
├─ parse-estatement.js     # Serverless Function (proxy AI; kunci OpenAI di server)
├─ extract-excel.js        # Serverless Function (ekstraksi e-statement -> 8 kolom + CSV)
└─ _estatement-columns.js  # skema 8 kolom (urutan tetap) — dipakai extract-excel
tools/
├─ estatement-columns.js   # skema 8 kolom (sumber kebenaran, dipakai CLI)
└─ estatement-to-excel.js  # CLI: transaksi JSON -> file .csv (+ .xlsx bila ada)
favicon.png, icon-192.png, icon-512.png, apple-touch-icon.png, manifest.webmanifest
vercel.json          # konfigurasi deploy Vercel (static + serverless)
.replit              # konfigurasi run/deploy Replit
replit.nix           # dependensi Nix untuk Replit
package.json         # metadata + script `start` (static server)
```

## Analisa e-Statement dengan AI (Proxy backend)

Saat pengguna mengunggah e-statement (PDF mutasi rekening), ATUR membaca SEMUA transaksinya dan menentukan kategori secara otomatis. Alurnya berlapis agar tetap jalan dalam segala kondisi:

1. **Proxy backend (diutamakan)** — frontend mengirim *teks* hasil ekstraksi PDF ke `POST /api/parse-estatement`. Function ini memanggil OpenAI memakai kunci RAHASIA yang disimpan di server (env var). **Kunci tidak pernah dikirim ke browser.**
2. **Kunci sendiri (BYO-key, opsional)** — bila proxy belum dikonfigurasi (server balas `501 ai-not-configured`) DAN pengguna mengisi kuncinya sendiri di *Profil → Kunci API AI*, browser memanggil OpenAI langsung. Berguna untuk menjalankan ATUR tanpa server.
3. **Pengurai lokal** — bila keduanya gagal, ATUR memakai heuristik regex di perangkat (tanpa AI).

### Variabel lingkungan (Vercel → Project → Settings → Environment Variables)

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Kunci OpenAI milik pemilik aplikasi. Tanpa ini, function balas `501` & frontend turun ke jalur lokal. |
| `OPENAI_MODEL` | — | `gpt-4o-mini` | Model chat completion. |
| `OPENAI_BASE_URL` | — | `https://api.openai.com/v1` | Untuk Azure/proxy OpenAI-compatible lain. |
| `ATUR_ALLOW_ORIGIN` | — | `*` | Origin yang diizinkan CORS. |

> Set `OPENAI_API_KEY` lalu **Redeploy** agar berlaku. Bila ATUR di-host di domain berbeda dari API-nya, set `window.ATUR_AI_PROXY_URL` ke URL function-nya.

## Ekstraksi e-Statement → Excel 8 kolom (untuk analisa di backend)

Selain `parse-estatement` (untuk impor ke aplikasi), tersedia jalur khusus yang mengubah e-statement menjadi tabel **8 kolom terstruktur** sebagai bahan analisa. Urutan kolom **tetap** (jangan diubah tanpa update CHANGELOG):

| # | Kolom | Isi |
|---|---|---|
| 1 | **Nama Kantong** | nama kantong/pocket (bila ada) |
| 2 | **Tanggal Transaksi** | tanggal lengkap (`dateFull`) |
| 3 | **Waktu** | waktu lengkap, jam s/d detik (`timeFull`) |
| 4 | **Sumber/Tujuan Transaksi** | pengirim/penerima (`source`) |
| 5 | **Rincian Transaksi** | deskripsi: merchant + info tambahan (`detail`) |
| 6 | **Catatan** | **saldo SETELAH transaksi** (running balance, `balance`) |
| 7 | **Jumlah** | nominal bertanda — **+ uang masuk / − uang keluar** |
| 8 | **Saldo** | **perubahan** saldo kantong = nilai Jumlah |

> Catatan: kolom **Catatan** (6) = saldo setelah transaksi, sedangkan **Saldo** (8) = perubahan/delta berdasarkan Jumlah. Keduanya sengaja dipisah sesuai definisi.

### A. Endpoint backend — `POST /api/extract-excel`

Kirim teks e-statement (hasil ekstraksi PDF/OCR di browser), balasannya:

```jsonc
{
  "columns": ["Nama Kantong","Tanggal Transaksi","Waktu","Sumber/Tujuan Transaksi",
              "Rincian Transaksi","Catatan","Jumlah","Saldo"],
  "rows":    [ /* array baris 8 kolom siap pakai */ ],
  "csv":     "<string CSV UTF-8+BOM, siap diunduh / dibuka di Excel>",
  "transactions": [ /* data mentah, kompat dgn parse-estatement */ ]
}
```

Memakai kunci OpenAI server yang sama (env var). Bila `OPENAI_API_KEY` belum diset → balas `501 ai-not-configured`.

### B. CLI backend — `tools/estatement-to-excel.js`

Untuk konversi batch/offline dari JSON transaksi menjadi berkas Excel:

```bash
cd deploy
node tools/estatement-to-excel.js parsed.json hasil_mei
#  -> hasil_mei.csv  (selalu; UTF-8+BOM, langsung dibuka di Excel/Sheets)
#  -> hasil_mei.xlsx (bila paket 'xlsx' terpasang: `npm i xlsx`)

# atau dari STDIN:
cat parsed.json | node tools/estatement-to-excel.js - hasil
```

`parsed.json` bisa berupa `{"transactions":[...]}` atau array transaksi langsung (field hasil `/api/parse-estatement`). Skema kolomnya bersumber tunggal dari `tools/estatement-columns.js`.



### Ekstraksi PDF & OCR (lazy-loaded)

Ekstraksi teks PDF memakai **pdf.js** dan, untuk e-statement hasil scan/foto yang tak punya lapisan teks, **Tesseract.js** (OCR ind+eng). Kedua pustaka **hanya diunduh dari CDN saat pengguna benar-benar memproses PDF** — alur normal aplikasi tetap mandiri/offline. Bila CDN diblokir, ATUR otomatis jatuh balik ke parser regex byte bawaan.

## Deploy ke Vercel

**Opsi A — Vercel CLI**
```bash
npm i -g vercel
vercel            # jalankan dari akar repo; ikuti prompt; deploy preview
vercel --prod     # deploy ke produksi
```

**Opsi B — Dashboard Vercel**
1. Push repo ke Git (GitHub/GitLab/Bitbucket). `index.html` sudah di akar repo.
2. Di Vercel: **Add New → Project → Import** repo tersebut.
3. Framework Preset: **Other**. Build Command: kosongkan. Root Directory: biarkan akar (`./`) — tidak perlu diubah karena `index.html` sudah di akar.
4. Tambahkan env var `OPENAI_API_KEY` (lihat tabel di atas).
5. **Deploy**. Vercel menyajikan `index.html` sebagai situs statis + menjalankan `api/parse-estatement.js` sebagai Serverless Function di `/api/parse-estatement`.

`vercel.json` sudah menyetel `cleanUrls`, header keamanan dasar, dan cache untuk HTML.

## Deploy ke Replit

**Opsi A — Import**
1. Di Replit: **Create → Import from GitHub**, pilih repo ini.
2. Replit membaca `.replit` + `replit.nix`. Klik **Run** → menjalankan `npx serve .`.
3. Untuk publik: buka tab **Deployments → Static**, set **Public dir = `.`**, lalu **Deploy**.

**Opsi B — Manual**
- Pastikan `index.html` ada di akar, lalu jalankan: `npx --yes serve . -l $PORT`.

## Pengembangan lokal

```bash
npx --yes serve . -l 3000
# buka http://localhost:3000
```
Atau cukup buka `index.html` langsung di browser (file://).

## Catatan teknis (hasil audit)

- **Self-contained pada alur inti**: satu-satunya sumber daya eksternal di alur normal adalah font Google (Plus Jakarta Sans) dengan `display=swap`; aplikasi tetap berjalan jika font gagal dimuat.
- **AI & PDF on-demand**: panggilan jaringan hanya terjadi saat memproses e-statement — ke `/api/parse-estatement` (proxy) atau OpenAI (BYO-key), plus unduhan CDN pdf.js/Tesseract.js yang lazy. Semua state aplikasi lain tetap di memori + `localStorage`.
- **Kunci AI aman**: kunci OpenAI utama disimpan di server (env var), tidak pernah dikirim ke browser.
- **Persistensi**: transaksi (`atur_manual_txns`), pilihan PIC kategori (`atur_pic`), dan penanggung jawab per transaksi tersimpan di `localStorage`.
- **Audit runtime**: seluruh layar dirender di mode Sendiri & Berdua tanpa error; interaksi inti (tambah/edit/hapus transaksi, filter, ganti PIC) terverifikasi.

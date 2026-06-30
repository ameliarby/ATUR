# ATUR — Aplikasi Pencatatan Keuangan

Prototipe aplikasi **pencatatan & pelacakan** keuangan pribadi (ATUR Sendiri) dan rumah tangga/pasangan (ATUR Berdua). Seluruh aplikasi adalah **satu file HTML statis** (`public/index.html`) — tanpa backend, tanpa build step, tanpa dependensi runtime. Data tersimpan lokal di browser (localStorage).

> Catatan: ATUR adalah aplikasi **pencatatan**, bukan aplikasi perbankan. Tidak ada perpindahan uang nyata maupun saldo virtual; semua angka dihitung dari transaksi yang dicatat pengguna.

## Struktur

```
deploy/
├─ public/
│  └─ index.html      # seluruh aplikasi (HTML + CSS + JS inline)
├─ api/
│  └─ parse-estatement.js  # Serverless Function (proxy AI; kunci OpenAI di server)
├─ vercel.json        # konfigurasi deploy Vercel (static + serverless)
├─ .replit            # konfigurasi run/deploy Replit
├─ replit.nix         # dependensi Nix untuk Replit
├─ package.json       # metadata + script `start` (static server)
└─ README.md
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

### Ekstraksi PDF & OCR (lazy-loaded)

Ekstraksi teks PDF memakai **pdf.js** dan, untuk e-statement hasil scan/foto yang tak punya lapisan teks, **Tesseract.js** (OCR ind+eng). Kedua pustaka **hanya diunduh dari CDN saat pengguna benar-benar memproses PDF** — alur normal aplikasi tetap mandiri/offline. Bila CDN diblokir, ATUR otomatis jatuh balik ke parser regex byte bawaan.

## Deploy ke Vercel

**Opsi A — Vercel CLI**
```bash
npm i -g vercel
cd deploy
vercel            # ikuti prompt; deploy preview
vercel --prod     # deploy ke produksi
```

**Opsi B — Dashboard Vercel**
1. Push folder `deploy/` ke repository Git (GitHub/GitLab/Bitbucket).
2. Di Vercel: **Add New → Project → Import** repo tersebut.
3. Framework Preset: **Other**. Build Command: kosongkan. Output/Static Directory: `public`.
4. Tambahkan env var `OPENAI_API_KEY` (lihat tabel di atas).
5. **Deploy**. Vercel menyajikan `public/index.html` sebagai situs statis + menjalankan `api/parse-estatement.js` sebagai Serverless Function di `/api/parse-estatement`.

`vercel.json` sudah menyetel `cleanUrls`, header keamanan dasar, dan cache untuk HTML.

## Deploy ke Replit

**Opsi A — Import**
1. Di Replit: **Create → Import from GitHub**, pilih repo berisi folder `deploy/` (atau unggah isinya ke root Repl).
2. Replit membaca `.replit` + `replit.nix`. Klik **Run** → menjalankan `npx serve public`.
3. Untuk publik: buka tab **Deployments → Static**, set **Public dir = `public`**, lalu **Deploy**.

**Opsi B — Manual**
- Pastikan `public/index.html` ada, lalu jalankan: `npx --yes serve public -l $PORT`.

## Pengembangan lokal

```bash
cd deploy
npx --yes serve public -l 3000
# buka http://localhost:3000
```
Atau cukup buka `public/index.html` langsung di browser (file://).

## Catatan teknis (hasil audit)

- **Self-contained pada alur inti**: satu-satunya sumber daya eksternal di alur normal adalah font Google (Plus Jakarta Sans) dengan `display=swap`; aplikasi tetap berjalan jika font gagal dimuat.
- **AI & PDF on-demand**: panggilan jaringan hanya terjadi saat memproses e-statement — ke `/api/parse-estatement` (proxy) atau OpenAI (BYO-key), plus unduhan CDN pdf.js/Tesseract.js yang lazy. Semua state aplikasi lain tetap di memori + `localStorage`.
- **Kunci AI aman**: kunci OpenAI utama disimpan di server (env var), tidak pernah dikirim ke browser.
- **Persistensi**: transaksi (`atur_manual_txns`), pilihan PIC kategori (`atur_pic`), dan penanggung jawab per transaksi tersimpan di `localStorage`.
- **Audit runtime**: seluruh layar dirender di mode Sendiri & Berdua tanpa error; interaksi inti (tambah/edit/hapus transaksi, filter, ganti PIC) terverifikasi.

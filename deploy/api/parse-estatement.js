// /api/parse-estatement  — Vercel Serverless Function (Node.js runtime)
//
// Proxy AI ATUR: menerima TEKS e-statement (hasil ekstraksi/OCR di sisi browser),
// memanggil OpenAI dengan API key RAHASIA dari environment variable server,
// lalu mengembalikan JSON array transaksi. API key TIDAK PERNAH dikirim ke browser.
//
// Konfigurasi (Vercel → Project → Settings → Environment Variables):
//   OPENAI_API_KEY   (wajib)  — kunci OpenAI milik pemilik aplikasi
//   OPENAI_MODEL     (opsional, default "gpt-4o-mini")
//   OPENAI_BASE_URL  (opsional, default "https://api.openai.com/v1") — untuk Azure/proxy lain
//   ATUR_ALLOW_ORIGIN(opsional) — origin yang diizinkan CORS; default "*" (situs statis)
//
// Catatan: file ini hanya memanggil layanan AI EKSTERNAL milik pemilik aplikasi
// (OpenAI / endpoint yang Anda set sendiri). Jangan mengarahkan ke endpoint
// inference internal perusahaan.

const MAX_CHARS = 16000;       // batasi panjang teks yang dikirim ke model
const RATE_WINDOW_MS = 60_000; // jendela rate-limit per-IP
const RATE_MAX = 12;           // maksimum request per jendela per-IP

// Rate-limit sederhana berbasis memori (per instance). Untuk skala besar
// gunakan KV/Redis; ini cukup untuk mencegah penyalahgunaan ringan.
const _hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (_hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  _hits.set(ip, arr);
  return arr.length > RATE_MAX;
}

function buildSystemPrompt(cats) {
  const catList = Array.isArray(cats) && cats.length
    ? cats.join(', ')
    : 'Revenue, Housing, Utilities, Subscription, Groceries, Shopping, Food, Family, Medical, Transport, Vacation, Investment, Selfcare, Entertainment';
  return (
    'Kamu pengurai e-statement bank Indonesia (mis. Bank Jago). E-statement bisa berbentuk per-KANTONG: ' +
    'tiap halaman punya header nama kantong (Kantong Utama, Shopping, Food, Holiday Fund, Transport, Utilities, ' +
    'Subscription, Groceries, Self Care, Annual Fund, dll.) lalu daftar transaksi dengan kolom: ' +
    'Tanggal & Waktu, Sumber/Tujuan, Rincian Transaksi, Catatan, Jumlah(+/-), Saldo. ' +
    'Aturan: (1) Ekstrak SEMUA transaksi dari SEMUA kantong, jangan lewatkan satu pun. ' +
    '(2) KATEGORI transaksi DITURUNKAN dari NAMA KANTONG bila ada (mis. "Food"->Food, "Holiday Fund"->Vacation, ' +
    '"Transport"->Transport, "Annual Fund"->Investment, "Self Care"->Selfcare). Bila tak ada kantong, tebak dari deskripsi. ' +
    '(3) "dir":"in" bila Jumlah bertanda + (uang masuk), "out" bila bertanda - (uang keluar). ' +
    '(4) "sender" = Sumber/Tujuan + Rincian. "note" = isi kolom Catatan (boleh kosong). ' +
    '(5) URUTKAN hasil secara KRONOLOGIS berdasarkan tanggal naik. ' +
    'Balas HANYA JSON object berbentuk {"transactions":[ ... ]}. Tiap item: ' +
    '{"sender":string,"note":string,"amt":number(rupiah, tanpa titik, selalu positif),' +
    '"date":"DD Mon"(Jan Feb Mar Apr Mei Jun Jul Agu Sep Okt Nov Des),"time":"HH:MM",' +
    '"dir":"in"|"out","pocket":string(nama kantong asal),"cat":salah satu dari [' + catList + '],"sub":string,"conf":0..1}.'
  );
}

module.exports = async function handler(req, res) {
  const allowOrigin = process.env.ATUR_ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method-not-allowed' }); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Server belum dikonfigurasi: beri sinyal jelas agar frontend fallback ke parser lokal.
    res.status(501).json({ error: 'ai-not-configured', message: 'OPENAI_API_KEY belum diset di server.' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ error: 'rate-limited' }); return; }

  // Body bisa sudah berupa object (Vercel auto-parse) atau string.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const text = (body && typeof body.text === 'string') ? body.text : '';
  const cats = (body && Array.isArray(body.cats)) ? body.cats : null;
  if (!text.trim()) { res.status(400).json({ error: 'no-text' }); return; }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  try {
    const upstream = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(cats) },
          { role: 'user', content: text.slice(0, MAX_CHARS) },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      res.status(502).json({ error: 'upstream-' + upstream.status, detail: detail.slice(0, 500) });
      return;
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content || '{"transactions":[]}';
    let arr = [];
    try {
      const p = JSON.parse(content);
      arr = Array.isArray(p) ? p : (p.transactions || p.data || p.items || []);
    } catch {
      const m = content.match(/\[[\s\S]*\]/);
      arr = m ? JSON.parse(m[0]) : [];
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ transactions: Array.isArray(arr) ? arr : [] });
  } catch (e) {
    res.status(500).json({ error: 'proxy-failed', message: String(e && e.message || e).slice(0, 300) });
  }
};

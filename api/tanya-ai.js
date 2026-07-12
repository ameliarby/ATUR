// /api/tanya-ai — Vercel Serverless Function (Node.js runtime)
//
// Proxy chat "Tanya AI" untuk ATUR: menerima riwayat pesan + ringkasan konteks
// keuangan pengguna (dihitung di sisi browser), memanggil model chat dengan
// API key RAHASIA dari environment server, lalu mengembalikan balasan asisten.
// API key TIDAK PERNAH dikirim ke browser.
//
// Konfigurasi (Vercel → Project → Settings → Environment Variables):
//   OPENAI_API_KEY   (wajib)  — kunci OpenAI milik pemilik aplikasi
//   OPENAI_MODEL     (opsional, default "gpt-4o-mini")
//   OPENAI_BASE_URL  (opsional, default "https://api.openai.com/v1")
//   ATUR_ALLOW_ORIGIN(opsional) — origin CORS; default "*"
//
// Catatan: file ini hanya memanggil layanan AI EKSTERNAL milik pemilik aplikasi
// (OpenAI / endpoint yang Anda set sendiri). Jangan mengarahkan ke endpoint
// inference internal perusahaan.

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const _hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (_hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  _hits.set(ip, arr);
  return arr.length > RATE_MAX;
}

// Pengetahuan produk ATUR — diberikan ke model sebagai "otak" asisten supaya
// jawaban akurat & spesifik tentang aplikasi ini (bukan jawaban umum).
function buildSystemPrompt(ctx) {
  ctx = ctx || {};
  const mode = ctx.mode === 'b' ? 'Atur Berdua (couple)' : 'Atur Sendiri (solo)';
  const cats = Array.isArray(ctx.cats) && ctx.cats.length ? ctx.cats.join(', ') : 'Food, Groceries, Transport, Housing, Utilities, Shopping, Subscription, Vacation, Selfcare, Medical, Entertainment, Education, Tax/Fee';
  const summary = ctx.summary ? JSON.stringify(ctx.summary) : '(ringkasan tidak tersedia)';
  return [
    'Kamu adalah "Tanya AI", asisten keuangan di dalam aplikasi ATUR — aplikasi keuangan pribadi Indonesia. Jawab SELALU dalam Bahasa Indonesia yang ramah, ringkas, dan actionable. Boleh pakai HTML sederhana: <b>, <ol class="step"><li>…</li></ol>, dan <div class="warn">…</div> untuk catatan penting. JANGAN pakai markdown, JANGAN pakai emoji.',
    '',
    '## Tentang ATUR',
    '- ATUR punya 2 mode: "Atur Sendiri" (keuangan pribadi) dan "Atur Berdua" (keuangan bersama pasangan/rumah tangga). User bisa berganti mode lewat toggle di atas dashboard.',
    '- Data transaksi masuk lewat 2 cara: (1) Input Manual, (2) Unggah e-Statement PDF yang dibaca & dikategorikan otomatis oleh AI.',
    '- User bisa Export rekap transaksi ke Excel: tap ikon unduh di header, pilih mode (Sendiri/Berdua) + periode (Bulanan bulan+tahun ATAU Per tanggal rentang), lalu Unduh Excel.',
    '',
    '## ANGGARAN (Budget/Pagu) — jelaskan kegunaannya bila ditanya',
    '- Anggaran = batas (pagu) pengeluaran per kategori per bulan yang KAMU tetapkan sendiri (mis. Makan Rp 2 jt, Transport Rp 800 rb).',
    '- Kegunaannya: (1) mengerem pengeluaran supaya tidak jebol; (2) memberi peringatan/alert saat realisasi mendekati atau melewati pagu; (3) memudahkan lihat kategori mana yang paling boros vs rencana.',
    '- Cara pakai: buka menu Anggaran & Alert -> tombol "+ Tambah" -> pilih kategori -> isi pagu bulanan. Di mode Berdua, pagu adalah pagu rumah tangga dan bisa diberi penanggung jawab (Kamu / Pasangan / Tidak ada).',
    '- Default pagu KOSONG; kategori hanya muncul setelah user menambah pagunya.',
    '',
    '## TIPS agar analisa AI lebih PRESISI (sangat penting — sarankan ke user)',
    '- AI mengkategorikan transaksi dari deskripsi/merchant dan kolom Catatan. Jadi CATATAN yang jelas = kategori lebih akurat.',
    '- Sarankan user menambahkan penanda kata kunci di kolom Catatan agar terbaca 100% ke kategori yang benar, contоh:',
    '  - Tulis kata "meal" atau "makan" di catatan -> AI baca sebagai kategori Makanan (Food).',
    '  - "grab"/"gojek"/"taksi"/"bensin" -> Transport. "listrik"/"pln"/"internet" -> Utilities. "apotek"/"obat"/"dokter" -> Medical. "netflix"/"spotify"/"langganan" -> Subscription.',
    '- Untuk e-Statement, pastikan PDF diambil dari menu resmi bank/e-wallet supaya kolom Rincian lengkap; makin detail rincian, makin tinggi akurasi kategori.',
    '- Bila kategori salah, user bisa Edit transaksi manual — koreksi ini juga membantu.',
    '',
    '## Skor Kesehatan Finansial',
    '- Dihitung real-time dari transaksi: pendorong utama adalah savings rate ((pemasukan-pengeluaran)/pemasukan; >30% = sehat) dan kecukupan dana darurat (ideal 6 bulan pengeluaran).',
    '- Aset yang diberi Tujuan "Dana Darurat" otomatis dijumlah jadi Emergency Fund untuk skor ini.',
    '',
    '## Konteks pengguna saat ini',
    '- Mode aktif: ' + mode + '.',
    '- Kategori yang tersedia: ' + cats + '.',
    '- Ringkasan data (dihitung dari transaksi user): ' + summary,
    '',
    'Aturan menjawab: fokus ke ATUR & keuangan pribadi. Bila pertanyaan di luar topik keuangan/aplikasi, arahkan kembali dengan sopan. Selalu beri langkah konkret. Bila memberi angka dari ringkasan, sebut bahwa itu dihitung dari data user, bukan nasihat investasi. Jaga jawaban < 160 kata kecuali diminta detail.'
  ].join('\n');
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
    // Server belum dikonfigurasi: frontend akan fallback ke basis pengetahuan lokal.
    res.status(501).json({ error: 'ai-not-configured', message: 'OPENAI_API_KEY belum diset di server.' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ error: 'rate-limited' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const history = (body && Array.isArray(body.messages)) ? body.messages : [];
  const ctx = (body && typeof body.context === 'object') ? body.context : {};
  if (!history.length) { res.status(400).json({ error: 'no-messages' }); return; }

  // Sanitasi & batasi riwayat (ambil 12 pesan terakhir).
  const trimmed = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  try {
    const upstream = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 700,
        messages: [{ role: 'system', content: buildSystemPrompt(ctx) }, ...trimmed],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      res.status(502).json({ error: 'upstream-' + upstream.status, detail: detail.slice(0, 500) });
      return;
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ reply: String(reply).trim() });
  } catch (e) {
    res.status(500).json({ error: 'proxy-failed', message: String(e && e.message || e).slice(0, 300) });
  }
};

// estatement-prompt.js — Prompt SISTEM bersama untuk pengurai e-statement ATUR.
//
// Sumber kebenaran TUNGGAL prompt, dipakai oleh:
//   - /api/parse-estatement  (impor ke aplikasi)
//   - /api/extract-excel     (ekstraksi 8 kolom)
//
// Filosofi (pilihan A): backend menerima TEKS hasil ekstraksi PDF (pdf.js/OCR di
// browser). Format PDF e-statement BERMACAM-MACAM (Bank Jago, BCA, Mandiri, BNI,
// BRI, Jenius, dll.) — layout, urutan kolom, dan istilah berbeda-beda. Tugas AI:
// MEMBACA teks campur-aduk itu dan MENORMALKAN ke struktur 8 kolom seragam.

'use strict';

const DEFAULT_CATS = [
  'Revenue', 'Housing', 'Utilities', 'Subscription', 'Groceries', 'Shopping',
  'Food', 'Family', 'Medical', 'Transport', 'Vacation', 'Investment',
  'Selfcare', 'Entertainment',
];

function buildSystemPrompt(cats) {
  const catList = (Array.isArray(cats) && cats.length ? cats : DEFAULT_CATS).join(', ');
  return [
    // — Peran & konteks: format macam-macam —
    'Kamu pengurai e-statement / mutasi rekening bank Indonesia. Teks input adalah hasil ekstraksi PDF',
    '(boleh dari bank mana pun: Bank Jago, BCA, Mandiri, BNI, BRI, Jenius, dll.). FORMAT BERMACAM-MACAM:',
    'urutan kolom, nama kolom, pemisah, dan tata letak bisa berbeda; sebagian e-statement disusun PER-KANTONG',
    '(tiap bagian diawali header nama kantong: Kantong Utama, Shopping, Food, Holiday Fund, Transport, Utilities,',
    'Subscription, Groceries, Self Care, Annual Fund, dll.), sebagian lain hanya satu daftar mutasi tanpa kantong.',
    'TUGASMU: baca apa pun bentuknya, lalu NORMALKAN ke skema seragam di bawah. Jangan berhenti karena layout aneh.',

    // — Aturan ekstraksi —
    'Aturan:',
    '(1) Ekstrak SEMUA transaksi dari SEMUA bagian/kantong/halaman, jangan lewatkan satu pun. Abaikan baris non-transaksi',
    '(header tabel, subtotal, ringkasan, footer, info rekening).',

    // — KATEGORI: prioritas Nama Kantong dulu —
    '(2) KATEGORI ("cat") ditentukan dengan URUTAN PRIORITAS: (a) PERTAMA dari NAMA KANTONG bila transaksi berada di',
    'suatu kantong — petakan nama kantong ke kategori, mis. "Food"->Food, "Groceries"->Groceries, "Shopping"->Shopping,',
    '"Transport"->Transport, "Utilities"->Utilities, "Subscription"->Subscription, "Holiday Fund"->Vacation,',
    '"Annual Fund"->Investment, "Self Care"->Selfcare, "Kantong Utama"->tebak dari deskripsi. (b) BARU bila tidak ada',
    'kantong (atau kantong = Kantong Utama/umum), tebak kategori dari Rincian/deskripsi & merchant. Selalu pilih satu',
    'kategori dari daftar: [' + catList + '].',

    // — Arah dana —
    '(3) "dir":"in" bila uang MASUK (Jumlah bertanda +, atau kolom Kredit/CR terisi); "out" bila uang KELUAR',
    '(Jumlah bertanda -, atau kolom Debit/DB terisi).',

    // — Pisahkan source vs detail —
    '(4) PISAHKAN dua hal: "source" = murni Sumber/Tujuan transaksi (nama pengirim/penerima/rekening/bank lawan);',
    '"detail" = Rincian Transaksi (deskripsi cukup detail: nama merchant + info tambahan). Jika e-statement menyatukan',
    'keduanya, pecah sebaik mungkin. Untuk kompatibilitas, "sender" = gabungan source + detail; "note" = isi kolom',
    'Catatan/Keterangan e-statement (boleh string kosong).',

    // — Field lain —
    '(5) "pocket" = nama kantong asal (string kosong bila e-statement tidak berkantong).',
    '(6) "amt" = nominal transaksi dalam rupiah, angka BULAT tanpa titik/koma/simbol, SELALU positif (tanda dipisah ke "dir").',
    '(7) "balance" = SALDO kantong/rekening SETELAH transaksi (angka rupiah dari kolom Saldo/Balance; null bila tak tertera).',
    '(8) "date" = "DD Mon" (Jan Feb Mar Apr Mei Jun Jul Agu Sep Okt Nov Des); "dateFull" = tanggal lengkap APA ADANYA dari',
    'e-statement (mis. "12 Mei 2026" / "2026-05-12" / "12/05/26"); "time" = "HH:MM"; "timeFull" = waktu LENGKAP termasuk',
    'DETIK bila ada ("HH:MM:SS"), atau "HH:MM" bila tanpa detik, atau "" bila tak tertera.',
    '(9) URUTKAN hasil KRONOLOGIS naik berdasarkan tanggal & waktu.',

    // — Format keluaran —
    'Balas HANYA JSON object berbentuk {"transactions":[ ... ]} tanpa teks lain. Tiap item:',
    '{"pocket":string,"source":string,"detail":string,"sender":string,"note":string,',
    '"amt":number,"balance":number|null,"date":"DD Mon","dateFull":string,"time":"HH:MM","timeFull":string,',
    '"dir":"in"|"out","cat":salah satu dari [' + catList + '],"sub":string,"conf":0..1}.',
  ].join(' ');
}

module.exports = { buildSystemPrompt, DEFAULT_CATS };

// estatement-columns.js — Skema kolom Excel untuk hasil ekstraksi e-statement ATUR.
//
// Sumber kebenaran TUNGGAL untuk urutan & isi 8 kolom yang diminta:
//   1. Nama Kantong          (pocket)               — bila ada
//   2. Tanggal Transaksi     (dateFull)             — tanggal lengkap
//   3. Waktu                 (timeFull)             — jam s/d detik
//   4. Sumber/Tujuan Transaksi (source)
//   5. Rincian Transaksi     (detail)               — merchant + info tambahan
//   6. Catatan               (= saldo setelah transaksi)  -> balance
//   7. Jumlah                (amt bertanda)         — + masuk / - keluar
//   8. Saldo                 (perubahan saldo kantong berdasarkan Jumlah)
//
// CATATAN PENTING soal kolom 6 vs 8 (sesuai instruksi pemilik aplikasi):
//   - Kolom "Catatan" = SALDO SETELAH transaksi (running balance dari e-statement = field `balance`).
//   - Kolom "Saldo"   = PERUBAHAN saldo kantong berdasarkan Jumlah (delta = nilai Jumlah bertanda).
//   Keduanya sengaja dipisah sesuai definisi yang diberikan.

'use strict';

// Urutan & header kolom — JANGAN diubah tanpa update CHANGELOG.
const COLUMNS = [
  { key: 'pocket',   header: 'Nama Kantong' },
  { key: 'dateFull', header: 'Tanggal Transaksi' },
  { key: 'timeFull', header: 'Waktu' },
  { key: 'source',   header: 'Sumber/Tujuan Transaksi' },
  { key: 'detail',   header: 'Rincian Transaksi' },
  { key: 'catatan',  header: 'Catatan' },   // = saldo setelah transaksi (running balance)
  { key: 'jumlah',   header: 'Jumlah' },     // nominal bertanda (+ masuk / - keluar)
  { key: 'saldo',    header: 'Saldo' },      // perubahan saldo kantong (delta = jumlah)
];

function toNum(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (v == null) return 0;
  // buang semua selain digit, minus, titik desimal
  const s = String(v).replace(/[^0-9.\-]/g, '');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

// Ubah satu transaksi (format dari /api/parse-estatement) menjadi baris 8 kolom.
function txnToRow(t) {
  t = t || {};
  const dir = (t.dir === 'in') ? 'in' : 'out';
  const amtAbs = Math.abs(toNum(t.amt));
  const jumlah = dir === 'in' ? amtAbs : -amtAbs; // + masuk / - keluar

  // Fallback rapi bila field granular tak ada (kompatibilitas hasil lama).
  const source = (t.source != null && String(t.source).trim())
    ? String(t.source).trim()
    : (t.sender ? String(t.sender).split(' — ')[0].trim() : '');
  const detail = (t.detail != null && String(t.detail).trim())
    ? String(t.detail).trim()
    : (t.sender ? String(t.sender) : '');

  const dateFull = t.dateFull || t.date || '';
  const timeFull = t.timeFull || t.time || '';
  const balance  = (t.balance == null || t.balance === '') ? '' : toNum(t.balance); // saldo setelah transaksi

  return {
    pocket:   t.pocket || '',
    dateFull: dateFull,
    timeFull: timeFull,
    source:   source,
    detail:   detail,
    catatan:  balance,  // kolom 6: saldo setelah transaksi
    jumlah:   jumlah,   // kolom 7: nominal bertanda
    saldo:    jumlah,   // kolom 8: perubahan saldo kantong = jumlah
  };
}

function txnsToRows(txns) {
  return (Array.isArray(txns) ? txns : []).map(txnToRow);
}

// ---- CSV (UTF-8 + BOM, dipisah koma, bisa dibuka langsung di Excel/Sheets) ----
function csvCell(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function rowsToCSV(rows) {
  const head = COLUMNS.map((c) => csvCell(c.header)).join(',');
  const body = rows.map((r) => COLUMNS.map((c) => csvCell(r[c.key])).join(',')).join('\r\n');
  return '﻿' + head + (body ? '\r\n' + body : ''); // BOM agar Excel baca UTF-8
}
function txnsToCSV(txns) {
  return rowsToCSV(txnsToRows(txns));
}

module.exports = { COLUMNS, txnToRow, txnsToRows, rowsToCSV, txnsToCSV, toNum };

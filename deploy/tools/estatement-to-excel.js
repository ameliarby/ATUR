#!/usr/bin/env node
// estatement-to-excel.js — Konverter backend: transaksi e-statement -> file Excel (8 kolom).
//
// Memakai skema kolom TUNGGAL dari ./estatement-columns.js (urutan tetap):
//   1 Nama Kantong · 2 Tanggal Transaksi · 3 Waktu · 4 Sumber/Tujuan Transaksi
//   5 Rincian Transaksi · 6 Catatan(=saldo setelah transaksi) · 7 Jumlah(+/-) · 8 Saldo(=perubahan)
//
// PENGGUNAAN
//   node estatement-to-excel.js <input.json> [output_basename]
//
//   <input.json> : file JSON berisi {"transactions":[...]} ATAU array transaksi langsung,
//                  dengan field hasil /api/parse-estatement (pocket, source, detail, amt,
//                  balance, dateFull, timeFull, dir, dll). Pakai "-" untuk baca dari STDIN.
//   [output]     : nama dasar berkas keluaran (default: "estatement"). Akan menulis
//                  <output>.csv (selalu) dan <output>.xlsx (bila paket 'xlsx' terpasang).
//
// CONTOH
//   node estatement-to-excel.js parsed.json hasil_mei
//   cat parsed.json | node estatement-to-excel.js - hasil

'use strict';
const fs = require('fs');
const path = require('path');
const { COLUMNS, txnsToRows, rowsToCSV } = require('./estatement-columns');

function readInput(src) {
  const raw = (src === '-' )
    ? fs.readFileSync(0, 'utf8')
    : fs.readFileSync(src, 'utf8');
  let data;
  try { data = JSON.parse(raw); }
  catch (e) { console.error('ERROR: input bukan JSON valid:', e.message); process.exit(1); }
  if (Array.isArray(data)) return data;
  return data.transactions || data.rows || data.data || data.items || [];
}

function writeXlsxIfAvailable(rows, outBase) {
  let XLSX;
  try { XLSX = require('xlsx'); }
  catch { return null; } // paket opsional; lewati bila tak ada
  const aoa = [ COLUMNS.map((c) => c.header) ];
  rows.forEach((r) => aoa.push(COLUMNS.map((c) => {
    const v = r[c.key];
    return (v === '' || v == null) ? '' : v;
  })));
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [ {wch:16},{wch:18},{wch:12},{wch:26},{wch:38},{wch:18},{wch:16},{wch:16} ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'E-Statement');
  const out = outBase + '.xlsx';
  XLSX.writeFile(wb, out);
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Pakai: node estatement-to-excel.js <input.json|-> [output_basename]');
    process.exit(1);
  }
  const src = args[0];
  const outBase = (args[1] || 'estatement').replace(/\.(csv|xlsx|json)$/i, '');

  const txns = readInput(src);
  const rows = txnsToRows(txns);

  // CSV (selalu) — UTF-8 + BOM, bisa langsung dibuka di Excel / Google Sheets.
  const csv = rowsToCSV(rows);
  const csvPath = outBase + '.csv';
  fs.writeFileSync(csvPath, csv, 'utf8');

  // XLSX (opsional, bila paket 'xlsx' terpasang).
  const xlsxPath = writeXlsxIfAvailable(rows, outBase);

  console.error('OK · ' + rows.length + ' transaksi diekstrak.');
  console.error('  CSV : ' + path.resolve(csvPath));
  if (xlsxPath) console.error('  XLSX: ' + path.resolve(xlsxPath));
  else console.error('  (lewati .xlsx — paket "xlsx" belum terpasang; CSV cukup untuk Excel)');
}

main();

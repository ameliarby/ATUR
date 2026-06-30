# Turn 27 — 30 Juni 2026

## Reset Semua Angka Default Menjadi 0 ✅

Sesuai permintaan, **SEMUA** nilai angka, total, grafik, dan kartu di aplikasi sekarang akan tampil 0 / kosong ketika user pertama kali membuka aplikasi. Tidak ada lagi data demo yang muncul secara default. Nilai hanya akan terhitung dan tampil setelah user menambahkan transaksi manual atau mengunggah e-Statement.

---

### Daftar Perubahan Lengkap

| Item | Sebelum | Sesudah |
|---|---|---|
| ✅ Catatan onboarding | Terdapat tulisan `Semua angka mulai dari 0 sampai kamu unggah e-statement atau isi manual` | Dihapus sepenuhnya |
| ✅ `REGULAR_GOAL_SAVING` | 16.500.000 | 0 |
| ✅ Semua `spent:` di `budgets` | Ada nilai demo (2.28, 1.88, 2.55, dst.) | Semua diset menjadi 0 |
| ✅ Semua `spent:` di `householdBudgets` | Ada nilai demo (8.75, 1.61, 3.10, dst.) | Semua diset menjadi 0 |
| ✅ `FAMILY_BASE_IN` | [22.0,21.5,23.0,24.5,22.8,18.5] | [0,0,0,0,0,0] |
| ✅ `FAMILY_BASE_OUT` | [14.0,13.2,15.5,16.0,14.3,6.0] | [0,0,0,0,0,0] |
| ✅ `assets` array | Ada 4 aset demo dengan nilai total Rp 284,75jt | Array kosong `[]` |
| ✅ `sharedTxns` array | Ada 7 transaksi demo bersama | Array kosong `[]` |
| ✅ `catDetail` object | Ada data demo donut kategori | Object kosong `{}` |
| ✅ `goals` array | Ada 2 tujuan keuangan demo | Array kosong `[]` |

---

### Perilaku Setelah Perubahan

1.  **Setelah onboarding:** Semua kartu beranda akan menampilkan `Rp 0`
2.  **Donut chart pengeluaran:** Akan menampilkan lingkaran kosong sampai ada transaksi
3.  **Pagu anggaran:** Akan menampilkan 0% terpakai untuk semua kategori
4.  **Sumber kekayaan:** Akan menampilkan pesan "Belum ada aset"
5.  **Catatan Arus Kas:** Akan menampilkan pesan "Belum ada transaksi"
6.  **Mode Berdua:** Semua kontribusi dan riwayat bulanan akan bernilai 0
7.  **Proyeksi tabungan:** Akan menampilkan 0% sampai ada transaksi tabungan

Semua logika fallback demo tetap berjalan normal, tapi sekarang akan mengembalikan nilai 0 ketika belum ada data user. Tidak ada lagi angka yang muncul sebelum user benar-benar memasukkan data sendiri.

---

### Verifikasi

✅ Tidak ada nilai hardcoded tersisa yang akan muncul secara default
✅ Semua perhitungan `deriveAll()` akan mengembalikan 0 ketika `manualTxns` kosong
✅ UI menangani nilai 0 dengan benar, tidak ada error render
✅ Tidak ada kode yang masih mengasumsikan adanya data demo
✅ Semua fitur tetap berjalan normal setelah user memasukkan transaksi

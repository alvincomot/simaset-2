# Design Fitur Daftar & Riwayat Peminjaman

## 1. Tujuan

Menampilkan transaksi peminjaman melalui `GET /api/borrowing` dengan scoping role dari backend:

- `USER`: hanya transaksi miliknya.
- `SUPER_ADMIN`/`STAFF`: seluruh transaksi.

## 2. Information Architecture

Gunakan tabs/status filters:

- Semua.
- Pending.
- Aktif.
- Selesai.

Untuk User, page title “Pinjaman Saya”. Untuk Admin/Staff, “Riwayat Peminjaman”.

## 3. Summary Chips

Tampilkan count hasil list untuk tiap status bila data sudah tersedia. Count harus berasal dari response aktual, bukan placeholder.

## 4. Desktop Table

### Admin/Staff Columns

1. ID/reference singkat bila ada.
2. Peminjam.
3. Aset.
4. Tanggal pinjam.
5. Tenggat.
6. Tanggal kembali.
7. Status.
8. Kondisi kembali.
9. Detail.

### User Columns

1. Aset.
2. Tanggal pinjam.
3. Tenggat.
4. Tanggal kembali.
5. Status.
6. Detail.

## 5. Detail Drawer

- Asset summary.
- Borrower summary hanya Admin/Staff.
- Timeline status:
  - Pending.
  - Aktif setelah approved.
  - Selesai setelah return.
- Tanggal-tanggal terkait.
- Catatan request dan catatan return jika backend menggabungkannya; bila hanya satu field `catatan`, tampilkan label generik “Catatan”.
- Kondisi kembali bila selesai.

## 6. Filters

- Search nama/kode aset.
- Admin/Staff: search borrower NIM/nama.
- Date range.
- Status.
- Kondisi kembali.
- Kategori/lokasi bila relasi tersedia.

Filter mobile dalam bottom sheet.

## 7. Deadline Presentation

Untuk status Aktif:

- Hitung selisih tanggal secara client untuk label “3 hari lagi”, “Hari ini”, atau “Terlambat 2 hari”.
- Gunakan tanggal lokal Indonesia dan timezone yang konsisten.
- Ini hanya presentasi; jangan mengubah status backend.

## 8. Empty States

- User belum pernah meminjam: CTA “Jelajahi Katalog”.
- Tidak ada hasil filter: “Tidak ada transaksi yang sesuai filter.”
- Admin pending kosong: arahkan ke status lain, bukan katalog.

## 9. Export

Jangan menampilkan tombol export/print sebagai fitur aktif karena endpoint/reporting tidak disebutkan. Dapat ditaruh sebagai backlog, bukan disabled control permanen.

## 10. Loading & Error

- Skeleton table/cards.
- Error compact dengan retry.
- Pertahankan filter saat retry.

## 11. Micro-interactions

- Tab indicator slide 180ms.
- Timeline nodes animate scale-in saat drawer terbuka.
- Row status update mendapat highlight.

## 12. Acceptance Criteria

- User tidak pernah melihat transaksi milik pengguna lain.
- Semua enum status tampil dengan badge global.
- Detail timeline sesuai field yang benar-benar tersedia.
- Filter dapat dikombinasikan dan di-reset.
- Tampilan mobile menggunakan cards yang mudah dibaca.

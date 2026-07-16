# Design Fitur Pengembalian Aset

## 1. Tujuan

Memproses pengembalian transaksi `AKTIF` melalui `POST /api/borrowing/return/:id`, termasuk kondisi kembali dan catatan.

## 2. Entry Point

- Halaman `/borrowings?status=AKTIF`.
- Tombol “Proses Pengembalian” pada row/card transaksi aktif.

## 3. Active Borrowing List

Columns/cards:

- Peminjam.
- Aset.
- Tanggal pinjam.
- Tenggat.
- Status tenggat: tepat waktu atau terlambat, dihitung dari tanggal saat ini.
- Status Aktif.
- Action.

Warna keterlambatan dapat menggunakan warning/error tetapi label teks wajib ada.

## 4. Return Form

### Read-only Summary

- Nama dan kode aset.
- Peminjam dan NIM.
- Tanggal pinjam.
- Tenggat.
- Lama peminjaman.

### Required Input

- Kondisi kembali: segmented control/card radio `BAIK` atau `RUSAK`.
- Catatan pengembalian: textarea. Direkomendasikan required ketika kondisi `RUSAK`, bila backend mengizinkan rule client tersebut.

### Dynamic Warning

Ketika `RUSAK` dipilih:

- Tampilkan warning rose/amber.
- Jelaskan bahwa backend akan memperbarui kondisi fisik aset menjadi Rusak.
- Status ketersediaan setelah return mengikuti backend summary menjadi Tersedia; jangan mengklaim otomatis Pemeliharaan.

## 5. Confirmation

Dialog final merangkum:

- Aset.
- Kondisi kembali.
- Catatan.
- Dampak: transaksi Selesai, tanggal kembali dicatat, status aset diperbarui.

Tombol:

- Kondisi Baik: primary indigo.
- Kondisi Rusak: warning/destructive emphasis, tetapi label tetap “Konfirmasi Pengembalian”.

## 6. Success State

- Row keluar dari daftar Aktif.
- Toast: “Pengembalian berhasil diproses.”
- Optional success detail menampilkan kondisi akhir.
- Tidak ada undo karena tidak didukung endpoint.

## 7. Error Handling

- Transaksi bukan Aktif/sudah selesai: refresh dan tampilkan message.
- Validation error: inline.
- Server error: modal tetap terbuka dan input tidak hilang.

## 8. Mobile

- Full-screen form.
- Kondisi menjadi dua selectable cards stacked/2-column.
- Footer sticky.

## 9. Accessibility

- Kondisi kembali menggunakan semantic radio group.
- Warning kondisi rusak dibaca screen reader.
- Confirm dialog menyebut dampak perubahan.

## 10. Acceptance Criteria

- Hanya transaksi Aktif yang memiliki action return.
- Kondisi kembali hanya `BAIK` atau `RUSAK`.
- Success mengubah status transaksi menjadi Selesai sesuai response.
- UI tidak mengubah aset ke Pemeliharaan tanpa dukungan backend.

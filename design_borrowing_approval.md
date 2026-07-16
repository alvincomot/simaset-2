# Design Fitur Persetujuan Peminjaman

## 1. Tujuan

Memungkinkan `SUPER_ADMIN` dan `STAFF` menyetujui permintaan `PENDING` melalui `POST /api/borrowing/approve/:id`.

## 2. Batasan Penting

Backend yang diringkas hanya menyediakan aksi **approve**, tidak ada endpoint reject. Oleh karena itu UI tidak boleh menampilkan tombol “Tolak” yang seolah berfungsi.

## 3. Page Layout

Route: `/borrowings?status=PENDING`

Header:

- Title: “Permintaan Peminjaman”.
- Pending count badge.
- Search berdasarkan nama/NIM user, nama/kode aset bila data tersedia.

Filter:

- Tanggal pengajuan.
- Tenggat.
- Aset/kategori opsional.

## 4. Desktop Table

Columns:

1. Peminjam — nama lengkap + NIM.
2. Aset — nama + kode.
3. Tanggal pinjam/pengajuan.
4. Tenggat waktu.
5. Catatan/tujuan, truncated.
6. Status Pending.
7. Aksi “Tinjau”.

Klik Tinjau membuka side drawer.

## 5. Review Drawer

Sections:

- Profil peminjam minimum: nama dan NIM.
- Detail aset: nama, kode, lokasi, kondisi, availability saat ini.
- Timeline: diajukan → menunggu persetujuan.
- Tenggat dan catatan lengkap.
- Warning jika aset tidak lagi tersedia.

Footer:

- Tutup.
- Approve: “Setujui Peminjaman”.

## 6. Approve Confirmation

Gunakan confirm dialog singkat:

- “Setujui peminjaman [nama aset] untuk [nama user]?”
- Jelaskan bahwa status transaksi menjadi Aktif dan aset menjadi Dipinjam.
- Tombol utama indigo, bukan destructive.

## 7. Success Behavior

- Setelah server sukses, row keluar dari daftar Pending dengan collapse animation 180ms.
- Toast: “Peminjaman disetujui dan aset ditandai Dipinjam.”
- Optional undo tidak ditampilkan karena tidak ada endpoint reversal.

## 8. Error Cases

- Asset sudah tidak tersedia: tampilkan conflict alert, refresh data.
- Borrowing sudah diproses: remove/update row setelah refresh.
- Server error: drawer tetap terbuka.

## 9. Mobile

- Gunakan cards dengan peminjam, aset, tenggat, badge, dan tombol Tinjau.
- Review menjadi full-screen sheet.
- Approve action sticky di bawah.

## 10. Acceptance Criteria

- Hanya Pending yang dapat di-approve.
- UI tidak memiliki tombol Reject.
- Approve tidak optimistic; tunggu server.
- Setelah sukses, status lokal menjadi Aktif dan asset Dipinjam.
- Role USER tidak dapat mengakses halaman.

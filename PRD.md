# Product Requirements Document (PRD)
**Nama Proyek:** Sistem Informasi Manajemen Aset Operasional & Inventaris
**Platform:** Web Application

---

## 1. Tujuan Proyek (Objective)
Membangun sistem informasi terpusat untuk mengelola inventaris aset operasional, melacak kondisi dan lokasi aset, mendukung proses alokasi aset ke lokasi tertentu, serta mendigitalisasi proses peminjaman dan pengembalian aset.

## 2. Batasan Sistem (Scope & Out-of-Scope)
**In-Scope (Yang akan dibuat):**
- Pencatatan barang masuk (pengadaan) dan masing masing fitur barang keluar (penghapusan/rusak).
- Sistem peminjaman dan pengembalian barang (*checkout/check-in*).
- Manajemen data master (Lokasi, Kategori).
- Autentikasi dan otorisasi pengguna berbasis *Role*.

**Out-of-Scope (Yang TIDAK akan dibuat agar fokus):**
- Perhitungan depresiasi/penyusutan nilai uang secara akuntansi kompleks.
- Sistem pembelian/pengadaan barang terintegrasi dengan vendor (hanya mencatat barang yang sudah dibeli).

## 3. Aktor & Hak Akses (User Roles)
Sistem ini memiliki 3 level pengguna:
1. **Super Admin (Kepala / Koordinator):** Memiliki akses penuh ke seluruh sistem, termasuk menghapus data master, menambah user baru, dan melihat semua laporan.
2. **Manajer Aset (Asisten / Staf Inventaris):** Bisa melakukan CRUD pada data aset, mengelola persetujuan peminjaman, dan memperbarui kondisi barang (misal: dari "Baik" menjadi "Rusak").
3. **Pengguna Biasa (Mahasiswa / Dosen):** Hanya bisa melihat daftar aset yang berstatus "Tersedia", melakukan permintaan peminjaman, dan melihat riwayat peminjamannya sendiri.

## 4. Alur Bisnis Utama (Core User Flows)
* **Alur Peminjaman:** 
  Pengguna Biasa *request* pinjam barang -> Manajer Aset melakukan *Approve* -> Status barang berubah menjadi "Dipinjam" -> Pengguna mengembalikan barang -> Manajer Aset memverifikasi kondisi barang saat dikembalikan -> Status barang kembali "Tersedia".
* **Alur Penambahan Aset:**
  Manajer Aset input data barang -> Sistem *generate* ID/Kode Barang unik -> Barang masuk ke daftar inventaris dengan status "Tersedia".
* **Alur Alokasi Aset:** Manajer Aset memilih aset -> Menentukan lokasi tujuan -> Status aset berubah menjadi **Dialokasikan** -> Riwayat alokasi tersimpan -> Jika aset dipindahkan ke lokasi lain, sistem mencatat **Riwayat Relokasi**.
* **Alur Pemeliharaan:** Manajer Aset mengubah status aset menjadi **Pemeliharaan** -> Aset tidak dapat dipinjam -> Setelah selesai diperbaiki status kembali menjadi *Tersedia*.

## 5. Fitur Utama (Features)
* **Autentikasi Spesifik Kampus (FTI UKSW):** 
  - Login utama menggunakan **NIM** dan Password.
  - Fitur "Lupa Password" menggunakan pengiriman *Link Reset* via email.
  - **Ketentuan Khusus:** Sistem hanya menerima email dengan domain `@student.uksw.edu`.
  - Logout.
* **Dasborhboard Super Admin**  
  Dashboard menampilkan ringkasan informasi inventaris berupa:
  - Total inventaris.
  - Jumlah aset yang sedang dipinjam.
  - Jumlah aset rusak.
  - Daftar peminjaman terbaru.
  - Shortcut menuju proses persetujuan peminjaman.
* **Manajemen Inventaris:** CRUD untuk Aset, melihat detail, kondisi serta status Aset.
* **Manajemen Master Data:** CRUD untuk Kategori Aset (Elektronik, Aksesoris, dll) dan Lokasi (Lab A, Ruang Dosen, dll).
* **Katalog Aset:** Melihat detail aset, mengajukan pinjaman, dan tabel daftar aset dengan fitur pencarian dan filter (berdasarkan kategori, lokasi, atau status).
* **Peminjaman:** Pengajuan peminjaman, persetujuan peminjaman, pengembalian aset, riwayat transaksi, dan status peminjaman(Pending, Aktif, Ditolak, Selesai).

## 6. Halaman Sistem (Pages)
* **Halaman Super Admin**
  - Dashboard
  - Manajemen Aset
  - Ringkasan per Lokasi
  - Antrian Pending
  - Sedang Dipinjam
  - Riwayat Transakasi
  - Manajemen Kategori
  - Manajemen Lokasi
 
* **Halaman Pengguna**
  - Katalog Aset
  - Pinjaman Saya
  - Riwayat Peminjaman

## 7. Teknologi (Tech Stack)
* **Frontend:** React, TailwindCSS
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **ORM:** Prisma ORM

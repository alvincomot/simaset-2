# Product Requirements Document (PRD)
**Nama Proyek:** Sistem Informasi Manajemen Aset Operasional & Inventaris
**Platform:** Web Application

---

## 1. Tujuan Proyek (Objective)
Membangun sistem informasi terpusat untuk melacak siklus hidup barang operasional (inventaris) guna meminimalisir kehilangan barang, memudahkan pelacakan kondisi fisik, dan mendigitalkan proses peminjaman aset.

## 2. Batasan Sistem (Scope & Out-of-Scope)
**In-Scope (Yang akan dibuat):**
- Pencatatan barang masuk (pengadaan) dan barang keluar (penghapusan/rusak).
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

## 5. Fitur Utama (Features)
* **Autentikasi Spesifik Kampus (FTI UKSW):** 
  - Login utama menggunakan **NIM** dan Password.
  - Fitur "Lupa Password" menggunakan pengiriman *Link Reset* via email.
  - **Ketentuan Khusus:** Sistem hanya menerima email dengan domain `@student.uksw.edu`.
* **Dasbor Utama:** Menampilkan ringkasan total aset, aset dipinjam, dan aset rusak (berupa angka dan grafik sederhana).
* **Manajemen Master Data:** CRUD untuk Kategori Aset (Elektronik, Furnitur, dll) dan Lokasi (Lab A, Ruang Dosen, dll).
* **Katalog Aset:** Tabel daftar barang dengan fitur pencarian dan filter (berdasarkan kategori, lokasi, atau status).
* **Transaksi Peminjaman:** Form peminjaman yang mencatat tanggal pinjam, tenggat waktu pengembalian, dan tujuan peminjaman.

## 6. Teknologi (Tech Stack)
* **Frontend:** React, TailwindCSS
* **Backend:** Node.js, Express.js
* **Database:** MySQL
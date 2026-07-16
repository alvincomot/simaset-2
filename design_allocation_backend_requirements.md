# Backend Requirements untuk Fitur Alokasi

## 1. Tujuan

Dokumen ini mendeskripsikan kemampuan backend minimum yang harus tersedia sebelum frontend alokasi diaktifkan. Dokumen ini **tidak menetapkan nama endpoint atau struktur kode**; routing dan field final harus mengikuti implementasi backend aktual.

## 2. Status

Backend SIMASET yang diringkas sebelumnya belum mencakup status `DIALOKASIKAN`, pemisahan lokasi aktual dan lokasi alokasi, alokasi/relokasi, maupun siklus pemeliharaan lengkap. Karena itu, frontend wajib menggunakan feature gate sampai kontrak backend final terverifikasi.

## 3. Kemampuan Minimum

Backend harus mampu:

1. Menyimpan status `DIALOKASIKAN` pada status ketersediaan.
2. Menyimpan satu lokasi alokasi aktif per aset.
3. Menyimpan lokasi aktual aset secara terpisah ketika diperlukan.
4. Mengalokasikan satu aset.
5. Mengalokasikan banyak aset dalam satu permintaan bisnis atau mekanisme bulk yang terdefinisi.
6. Merelokasi aset secara atomik.
7. Memulai pemeliharaan dengan memindahkan lokasi aktual ke ruang servis tanpa menghapus lokasi alokasi.
8. Menyelesaikan servis kondisi Baik dan mengembalikan lokasi aktual ke lokasi alokasi.
9. Menolak penyelesaian operasional bila kondisi masih Rusak.
10. Menyediakan riwayat audit alokasi dan pemeliharaan.
11. Menolak peminjaman aset `DIALOKASIKAN` di server.
12. Menyediakan data ringkasan alokasi yang aman untuk role `USER` tanpa mengekspos kode aset individual.
13. Melindungi penghapusan lokasi yang masih digunakan sebagai lokasi aktual, lokasi alokasi, atau tujuan pengembalian.

## 4. Validasi Server-Side Wajib

- Satu aset hanya memiliki satu alokasi aktif.
- Aset `DIPINJAM` tidak dapat dialokasikan atau direlokasi.
- Aset `PEMELIHARAAN` tidak dapat dialokasikan atau direlokasi.
- Relokasi ke lokasi yang sama ditolak.
- Lokasi tujuan harus valid.
- Hanya `SUPER_ADMIN` dan `STAFF` yang dapat memutasi alokasi/pemeliharaan.
- `USER` tidak dapat meminta pinjam aset dialokasikan walaupun memanipulasi request.
- Operasi relokasi tidak boleh gagal separuh jalan.

## 5. Kebutuhan Response Frontend

Response yang dikonsumsi frontend perlu dapat membedakan:

- status ketersediaan;
- kondisi;
- lokasi aktual;
- lokasi alokasi;
- apakah aset eligible untuk alokasi, relokasi, pemeliharaan, atau peminjaman;
- alasan bila tidak eligible;
- informasi audit yang sesuai role.

Nama key tidak ditentukan di dokumen ini. Frontend harus menggunakan adapter setelah response aktual diverifikasi.

## 6. Kebutuhan User Catalog

Backend harus menyediakan salah satu kontrak aman:

- endpoint ringkasan fasilitas dialokasikan untuk User; atau
- mode query pada katalog yang mengembalikan hasil teragregasi dan aman.

Response User tidak boleh memuat:

- kode aset individual;
- catatan servis;
- identitas staff;
- history internal.

Frontend tidak boleh mengambil endpoint Admin lalu menyembunyikan field secara client-side.

## 7. Idempotency dan Conflict

Untuk mutasi penting, backend sebaiknya:

- mencegah double submit menghasilkan event duplikat;
- mengembalikan conflict yang jelas bila status aset berubah;
- menjalankan perubahan status, lokasi, dan history dalam transaksi yang konsisten.

## 8. Feature Gate

Gunakan capability/feature flag default nonaktif sampai seluruh kontrak terverifikasi:

```text
assetAllocation: false
assetRelocation: false
allocatedCatalog: false
allocationMaintenance: false
allocationHistory: false
```

Nilai aktif hanya setelah backend yang diperlukan tersedia dan diuji.

## 9. Acceptance Criteria Integrasi

- Tidak ada UI aktif yang bergantung pada endpoint placeholder.
- Semua operasi bisnis tervalidasi backend.
- Frontend menangani 400/403/404/409/500 secara jelas.
- Data User terpisah dari data operasional Admin/Staff.
- Integrasi diuji pada single dan bulk allocation, relokasi, masuk servis, selesai servis Baik, dan hasil servis masih Rusak.

# Design Fitur Riwayat Alokasi Aset

## 1. Tujuan

Memberikan jejak audit untuk mengetahui kapan dan oleh siapa aset dialokasikan, dipindahkan, masuk pemeliharaan, dan dikembalikan ke lokasi alokasi.

Dokumen wajib dibaca bersama `allocation_business_rules.md`.

## 2. Role

- `SUPER_ADMIN`: dapat melihat seluruh riwayat.
- `STAFF`: dapat melihat seluruh riwayat operasional.
- `USER`: tidak dapat melihat riwayat alokasi individual.

## 3. Jenis Kejadian

Jenis kejadian bisnis minimum:

- Dialokasikan ke lokasi.
- Direlokasi dari lokasi A ke lokasi B.
- Masuk pemeliharaan dan berpindah ke ruang servis.
- Selesai servis dan kembali ke lokasi alokasi.
- Hasil pemeriksaan masih rusak dan tetap di pemeliharaan.
- Alokasi dicabut, hanya bila operasi tersebut nantinya didukung backend.

Nama enum/event teknis mengikuti backend aktual. UI menggunakan label manusiawi.

## 4. Data yang Ditampilkan

Setiap event menampilkan:

- tanggal dan waktu;
- kode dan nama aset;
- jenis kejadian;
- lokasi asal;
- lokasi tujuan;
- staff yang melakukan;
- catatan bila ada.

Untuk event yang tidak memiliki lokasi asal/tujuan, tampilkan dash semantik, bukan string `null`.

## 5. Entry Point

- Tab “Riwayat Alokasi” pada detail aset.
- Halaman global Riwayat Alokasi untuk Admin/Staff.
- Timeline ringkas pada detail lokasi.

## 6. Global History Page

### Filter

- Search kode/nama aset.
- Jenis kejadian.
- Lokasi asal/tujuan.
- Staff.
- Rentang tanggal kejadian.

Rentang tanggal hanya untuk pencarian histori; bukan tenggat alokasi.

### Table Columns

1. Waktu.
2. Aset.
3. Aktivitas.
4. Perpindahan lokasi.
5. Dilakukan oleh.
6. Catatan/detail.

Mobile berubah menjadi timeline cards.

## 7. Detail Asset Timeline

- Urut terbaru ke terlama secara default.
- Marker berbeda per event tetapi selalu disertai teks.
- Relokasi menampilkan “Lab 1 → Lab 2”.
- Pemeliharaan menampilkan lokasi servis dan tujuan kembali.

## 8. Data Integrity

- Riwayat bersifat read-only di UI.
- Tidak ada tombol edit atau hapus.
- Jangan membangun history dari state frontend atau local storage.
- Event hanya dianggap tercatat jika backend mengembalikan keberhasilan.

## 9. Loading, Empty, Error

- Timeline skeleton mengikuti tinggi row stabil.
- Empty state: “Belum ada riwayat alokasi untuk aset ini.”
- Error memiliki Retry tanpa menutup detail aset.

## 10. Acceptance Criteria

- Setiap perubahan lokasi dapat ditelusuri.
- Relokasi menyimpan lokasi asal dan tujuan.
- Masuk/selesai servis tercatat sebagai event terpisah.
- User tidak melihat audit internal.
- Riwayat tidak dapat diubah dari frontend.

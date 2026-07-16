# Design Fitur Pemeliharaan Aset Teralokasi

## 1. Tujuan

Mengelola aset teralokasi yang masuk ruang servis tanpa kehilangan lokasi alokasi asal, lalu mengembalikannya ke ruangan tersebut setelah servis selesai dan kondisi dinyatakan baik.

Dokumen wajib dibaca bersama `allocation_business_rules.md`.

## 2. Prinsip Domain

Saat aset teralokasi masuk servis:

- status menjadi `PEMELIHARAAN`;
- lokasi aktual menjadi ruang servis;
- lokasi alokasi tetap tersimpan;
- aset tidak dapat dipinjam atau direlokasi.

Tidak ada pengembalian otomatis berbasis waktu. Pengembalian terjadi melalui konfirmasi staff bahwa aset sudah selesai diservis dan secara fisik sudah kembali ke lokasi alokasi.

## 3. Role

- `SUPER_ADMIN`: dapat memulai dan menyelesaikan pemeliharaan.
- `STAFF`: dapat memulai dan menyelesaikan pemeliharaan.
- `USER`: tidak memiliki aksi dan tidak melihat detail servis internal.

## 4. Memulai Pemeliharaan

### Trigger

- Detail aset.
- Row action pada inventaris.
- Halaman aset per lokasi.

Label: **Pindahkan ke Pemeliharaan**.

### Form

- Aset — read-only.
- Lokasi alokasi asal — read-only.
- Ruang servis — required, dipilih dari master lokasi yang tersedia.
- Kondisi saat masuk — `BAIK`/`RUSAK`, biasanya `RUSAK` tetapi tidak di-hardcode.
- Catatan kerusakan/keluhan — required agar proses dapat ditelusuri.

MVP tidak menambahkan tipe lokasi baru. Ruang servis dipilih dari master lokasi yang ada. Backend dapat menetapkan konfigurasi tambahan di masa depan, tetapi frontend tidak boleh mengarang field tipe lokasi.

### Success

- Badge status menjadi Pemeliharaan.
- Tampilkan dua lokasi secara jelas:
  - “Sedang berada di: Ruang Servis”
  - “Akan kembali ke: Lab Komputer 1”
- Sembunyikan aksi Pinjam, Alokasi, dan Relokasi.

## 5. Menyelesaikan Pemeliharaan

Primary action:

> **Selesaikan Servis & Kembalikan ke [Lokasi Alokasi]**

### Form

- Kondisi setelah servis — required.
- Catatan hasil servis — required.
- Lokasi tujuan pengembalian — read-only dari lokasi alokasi.
- Checkbox/confirmation statement: “Aset telah dikembalikan secara fisik ke lokasi alokasi.”

### Bila Kondisi `BAIK`

- status kembali `DIALOKASIKAN`;
- lokasi aktual kembali ke lokasi alokasi;
- lokasi alokasi tetap sama;
- aset kembali dihitung sebagai fasilitas operasional ruangan;
- audit event selesai servis ditambahkan.

### Bila Kondisi `RUSAK`

- sistem tidak boleh menyelesaikan pengembalian sebagai aset operasional;
- status tetap `PEMELIHARAAN`;
- lokasi aktual tetap ruang servis;
- tampilkan guidance bahwa servis perlu dilanjutkan atau proses lain ditentukan.

Tombol primary dapat berubah menjadi “Simpan Hasil Pemeriksaan” ketika kondisi masih Rusak, bukan “Kembalikan”.

## 6. Tampilan Detail Pemeliharaan

Admin/Staff melihat:

- kode dan nama aset;
- status dan kondisi;
- lokasi aktual;
- lokasi alokasi;
- catatan masuk servis;
- waktu dan staff yang memulai;
- aksi penyelesaian bila masih aktif.

User tidak melihat catatan, staff, atau detail servis individual.

## 7. Dashboard/Queue

Bila backend mendukung daftar pemeliharaan:

- widget “Dalam Pemeliharaan”;
- daftar aset servis dengan lokasi alokasi tujuan;
- filter lokasi servis, lokasi alokasi, kondisi, dan lama proses.

Jangan mengarang SLA atau tenggat servis karena keputusan bisnis tidak menggunakan deadline.

## 8. Error dan Conflict State

- Aset sudah berubah status: blok submit dan refetch.
- Lokasi alokasi telah dihapus/tidak valid: backend harus menolak; UI tampilkan blocker untuk Admin/Staff.
- Ruang servis sama dengan lokasi alokasi: boleh ditolak atau diberi warning sesuai kebijakan backend aktual; default desain mengharapkan lokasi servis berbeda.
- Submit gagal: pertahankan catatan dan kondisi.

## 9. Micro-interactions

- Perubahan lokasi divisualkan dengan transition sederhana, bukan animasi perjalanan dekoratif.
- Success state menampilkan check dan destination label.
- Skeleton detail menjaga layout agar tidak bergeser.

## 10. Acceptance Criteria

- Lokasi alokasi tidak hilang saat masuk pemeliharaan.
- Aset pemeliharaan tidak dapat dipinjam atau direlokasi.
- Selesai servis kondisi Baik mengembalikan aset ke alokasi asal.
- Kondisi Rusak tidak dapat dikembalikan sebagai operasional.
- Aksi penyelesaian berarti konfirmasi servis selesai dan pengembalian fisik.
- Tidak ada job otomatis berdasarkan tanggal/tenggat.

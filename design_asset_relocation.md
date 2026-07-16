# Design Fitur Relokasi Aset

## 1. Tujuan

Memindahkan aset yang sudah `DIALOKASIKAN` dari satu ruangan ke ruangan lain secara langsung, tanpa proses cabut alokasi manual terpisah.

Dokumen wajib dibaca bersama `allocation_business_rules.md`.

## 2. Prinsip Utama

Relokasi adalah satu transaksi bisnis atomik:

> Lokasi lama digantikan oleh lokasi baru dalam satu aksi sukses.

Kode aset unik memastikan aset yang benar dipindahkan, tetapi riwayat perpindahan tetap wajib dicatat.

## 3. Role

- `SUPER_ADMIN`: dapat merelokasi.
- `STAFF`: dapat merelokasi.
- `USER`: tidak memiliki akses.

## 4. Prasyarat

Relokasi hanya tersedia bila:

- status aset `DIALOKASIKAN`;
- aset tidak sedang `PEMELIHARAAN`;
- aset tidak berada dalam transaksi lain;
- lokasi tujuan berbeda dari lokasi alokasi saat ini.

Jika aset sedang servis, relokasi harus menunggu servis selesai agar tujuan pengembalian tidak ambigu.

## 5. Alur Single Relocation

1. Staff membuka detail aset atau menu row.
2. Memilih “Pindahkan Alokasi”.
3. Sistem menampilkan lokasi asal read-only.
4. Staff memilih lokasi tujuan.
5. Catatan alasan pemindahan bersifat opsional tetapi direkomendasikan.
6. Konfirmasi menampilkan: `[Kode Aset] Lab Komputer 1 → Lab Komputer 2`.
7. Setelah sukses:
   - status tetap `DIALOKASIKAN`;
   - lokasi alokasi menjadi lokasi tujuan;
   - lokasi aktual menjadi lokasi tujuan;
   - aset hilang dari ringkasan lokasi lama dan muncul di lokasi baru;
   - riwayat audit ditambahkan.

## 6. Bulk Relocation

Bulk relocation diperbolehkan untuk memindahkan beberapa aset dari satu atau beberapa lokasi ke satu lokasi tujuan.

Aturan UI:

- semua aset terpilih harus eligible;
- tampilkan grouping lokasi asal pada ringkasan;
- aset yang sudah berada di lokasi tujuan dikeluarkan dari selection dan dijelaskan;
- konflik perubahan status ditampilkan per aset.

## 7. Confirmation Dialog

Title: **Pindahkan alokasi aset?**

Konten:

- kode dan nama aset / jumlah aset;
- lokasi asal;
- lokasi tujuan;
- catatan bahwa riwayat lokasi lama tetap tersimpan;
- warning jika pemindahan berdampak pada kapasitas fasilitas yang dilihat User.

Primary action: **Pindahkan Aset**.

## 8. Error Handling

- Lokasi tujuan sama: validasi inline, submit disabled.
- Aset berubah menjadi pemeliharaan/dipinjam: conflict alert dan refresh detail.
- Lokasi tujuan tidak aktif/tidak ditemukan: pertahankan form dan minta pilih ulang.
- Kegagalan backend tidak boleh menghapus aset dari lokasi asal di UI.

## 9. Accessibility dan Responsive

- Perubahan asal → tujuan dibaca screen reader dengan teks lengkap, bukan icon panah saja.
- Search lokasi dapat digunakan via keyboard.
- Mobile menggunakan full-screen dialog dengan summary compact.

## 10. Acceptance Criteria

- Tidak ada keadaan sementara yang menampilkan aset tanpa lokasi karena relokasi gagal.
- Status tetap `DIALOKASIKAN` setelah relokasi sukses.
- Lokasi lama dan baru tercatat di audit history.
- Relokasi tidak tersedia selama pemeliharaan.
- Data lokasi lama dan baru di-invalidasi/refetch setelah mutation.

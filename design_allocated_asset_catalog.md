# Design Fitur Katalog Aset Dialokasikan untuk User

## 1. Tujuan

Memberikan transparansi fasilitas ruangan kepada `USER` tanpa memenuhi katalog peminjaman dengan ratusan aset individual yang tidak dapat dipinjam.

Dokumen wajib dibaca bersama `allocation_business_rules.md`.

## 2. Default Catalog Behavior

Katalog User saat pertama dibuka tetap berorientasi peminjaman:

- default hanya aset `TERSEDIA` yang dapat dipinjam;
- aset `DIALOKASIKAN` tidak dimuat atau ditampilkan sebagai hasil default;
- filter status menyediakan opsi “Dialokasikan” hanya sebagai pilihan eksplisit.

Frontend tidak boleh menyimpulkan data alokasi dari daftar Admin. Backend harus menyediakan data yang memang aman untuk role User.

## 3. Filter

Tambahkan filter status untuk User:

- Tersedia — default aktif.
- Dialokasikan — opt-in.

Gunakan label yang jelas:

> “Tampilkan fasilitas yang dialokasikan ke ruangan”

Filter state disimpan di URL, misalnya `availability=DIALOKASIKAN`, mengikuti kontrak query backend aktual.

## 4. Bentuk Data yang Ditampilkan

Aset dialokasikan ditampilkan sebagai **ringkasan kelompok**, bukan item per kode aset.

Kelompok minimum:

- nama/jenis aset;
- kategori;
- lokasi alokasi;
- jumlah unit;
- badge Dialokasikan;
- keterangan “Tidak tersedia untuk peminjaman umum”.

Contoh:

> Komputer Desktop  
> Lab Komputer 1 · 25 unit  
> Dialokasikan · Tidak dapat dipinjam

## 5. Informasi yang Tidak Ditampilkan kepada User

- kode aset individual;
- kondisi per unit;
- catatan kerusakan atau servis;
- identitas staff;
- riwayat pemindahan;
- detail transaksi internal;
- tombol Ajukan Peminjaman.

Statistik kondisi seperti “23 baik, 1 rusak, 1 pemeliharaan” tidak digunakan pada MVP agar tidak menimbulkan interpretasi bahwa jumlah tersebut merupakan jaminan kesiapan real-time.

## 6. Detail Group

Klik card dapat membuka drawer informatif berisi:

- nama fasilitas;
- kategori;
- lokasi;
- jumlah unit dialokasikan;
- deskripsi lokasi jika aman dan tersedia;
- penjelasan bahwa fasilitas digunakan di ruangan dan bukan bagian katalog peminjaman.

Drawer tidak menampilkan daftar kode aset.

## 7. Search dan Grouping

Search dapat mencocokkan:

- nama aset;
- kategori;
- nama lokasi.

Grouping harus stabil agar 25 komputer identik tidak menjadi 25 card. Jangan melakukan grouping berbasis string semata bila backend menyediakan identifier kategori/jenis yang lebih andal.

## 8. Empty State

Bedakan:

- belum ada fasilitas dialokasikan;
- tidak ada hasil sesuai search/filter;
- data alokasi tidak dapat dimuat.

Copy contoh:

> “Tidak ada fasilitas dialokasikan yang cocok dengan pencarian ini.”

## 9. Responsive

- Desktop: 3–4 card per row.
- Tablet: 2 card.
- Mobile: 1 card.
- Filter menjadi bottom sheet di mobile.
- Jumlah unit memakai tabular numbers.

## 10. Accessibility

- Card menjelaskan jumlah unit dan lokasi dalam accessible name.
- Badge tidak hanya mengandalkan warna.
- Tidak ada CTA pinjam yang disabled tanpa penjelasan; CTA memang tidak ditampilkan.

## 11. Acceptance Criteria

- Dialokasikan tidak muncul pada hasil default User.
- Hanya muncul setelah filter eksplisit.
- Hasil ditampilkan terkelompok per jenis aset dan lokasi.
- User tidak melihat kode aset individual dan data internal.
- Tidak ada jalur peminjaman untuk aset dialokasikan.
- Admin/Staff tetap melihat aset individual pada inventaris mereka.

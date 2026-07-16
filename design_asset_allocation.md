# Design Fitur Alokasi Aset

## 1. Tujuan

Memungkinkan `SUPER_ADMIN` dan `STAFF` menetapkan satu atau banyak aset ke satu lokasi secara semi-permanen sehingga status aset menjadi `DIALOKASIKAN` dan tidak dapat dipinjam.

Dokumen wajib dibaca bersama `allocation_business_rules.md`.

## 2. Status Implementasi

Desain bisnis telah disetujui. UI aktif hanya boleh dibuat setelah backend menyediakan operasi alokasi dan validasi server-side. Sampai saat itu, fitur harus berada di balik feature flag dan tidak tampil pada production navigation.

## 3. Role

- `SUPER_ADMIN`: dapat mengalokasikan aset.
- `STAFF`: dapat mengalokasikan aset.
- `USER`: tidak memiliki aksi alokasi.

## 4. Entry Point

Aksi dapat diakses dari:

- halaman Aset Inventaris;
- detail aset;
- bulk action setelah memilih beberapa aset;
- halaman lokasi untuk menambahkan aset ke ruangan tersebut.

Label aksi:

- Single: **Alokasikan Aset**
- Bulk: **Alokasikan Aset Terpilih**

## 5. Kelayakan Aset

Aset dapat dipilih apabila:

- tidak berstatus `DIPINJAM`;
- tidak berstatus `PEMELIHARAAN`;
- tidak sedang diproses oleh mutasi lain;
- memiliki identitas/kode aset valid.

Aset yang sudah `DIALOKASIKAN` tidak masuk alur alokasi baru; gunakan fitur Relokasi.

Aset yang tidak memenuhi syarat tetap boleh terlihat pada daftar Admin/Staff, tetapi checkbox/action harus disabled dengan alasan yang dapat dibaca.

## 6. Alur Single Allocation

1. Staff membuka detail aset.
2. Staff memilih “Alokasikan Aset”.
3. Sistem menampilkan nama dan kode aset sebagai read-only.
4. Staff memilih lokasi tujuan dari master lokasi.
5. Staff dapat menambahkan catatan opsional.
6. Sistem menampilkan ringkasan konfirmasi.
7. Setelah berhasil:
   - status menjadi `DIALOKASIKAN`;
   - lokasi aktual dan lokasi alokasi sama dengan lokasi tujuan;
   - aset tidak lagi dapat dipinjam;
   - daftar, detail, statistik, dan ringkasan lokasi diperbarui.

## 7. Alur Bulk Allocation

Bulk allocation diperlukan untuk studi kasus banyak aset identik seperti 25 komputer per laboratorium.

### Selection

- Checkbox per row dan select-all untuk hasil halaman/filter yang sedang terlihat.
- Tampilkan jumlah aset terpilih pada sticky bulk action bar.
- Aset tidak eligible tidak boleh ikut terpilih.

### Form

- Lokasi tujuan — required.
- Catatan — optional dan berlaku untuk seluruh batch.
- Daftar ringkas aset terpilih dengan nama dan kode.

### Confirmation Summary

Tampilkan:

- jumlah aset;
- lokasi tujuan;
- distribusi kategori aset;
- peringatan bahwa aset tidak dapat dipinjam setelah dialokasikan.

### Result

- Operasi harus diperlakukan sebagai satu aksi bisnis yang konsisten.
- Bila backend mendukung hasil parsial, UI wajib menampilkan aset berhasil dan gagal secara eksplisit; jangan menyatakan seluruh batch sukses.
- Setelah sukses, selection dibersihkan dan data di-refresh.

## 8. UI Desktop

Gunakan side drawer atau modal lebar 640–720px:

- Header: Alokasikan Aset.
- Asset summary.
- Location searchable select.
- Optional note.
- Confirmation alert.
- Sticky footer: Batal dan Alokasikan.

Bulk flow dapat menggunakan full-page wizard ringan jika jumlah item besar, tetapi maksimum dua langkah: Pilih Tujuan → Konfirmasi.

## 9. UI Mobile

- Gunakan full-screen dialog atau bottom sheet tinggi.
- Selected assets tampil sebagai compact list, bukan tabel.
- Footer action sticky.
- Hindari dropdown native yang memotong nama lokasi panjang.

## 10. Feedback dan State

- Loading lokasi: skeleton/select disabled.
- Submit: tombol “Mengalokasikan…” dan cegah double submit.
- Success toast single: “20 aset berhasil dialokasikan ke Lab Komputer 1.”
- Error server mempertahankan pilihan lokasi dan selection.
- Conflict state menampilkan aset yang berubah status sejak dipilih.

## 11. Micro-interactions

- Bulk action bar slide-up 180ms.
- Selected row memakai brand-soft background.
- Setelah sukses, row mendapat highlight singkat dan badge berubah ke Dialokasikan.
- Hormati `prefers-reduced-motion`.

## 12. Acceptance Criteria

- Hanya Admin/Staff yang melihat aksi.
- Satu aset hanya memiliki satu alokasi aktif.
- Aset dipinjam/pemeliharaan tidak dapat dialokasikan.
- Bulk allocation menangani minimal puluhan aset tanpa UI macet.
- Backend menjadi sumber kebenaran status dan lokasi.
- UI tidak menganggap sukses sebelum response backend berhasil.
- Aset hasil alokasi tidak memiliki CTA peminjaman.

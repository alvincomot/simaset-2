# Design Fitur Master Lokasi

## 1. Tujuan

CRUD lokasi aset untuk `SUPER_ADMIN` dan `STAFF`, termasuk lokasi penyimpanan, laboratorium, ruang kerja, dan ruang servis.

Lokasi adalah master data fisik. Versi ini tidak menambahkan penanggung jawab ruangan atau tipe organisasi.

## 2. Layout

- Page header: “Lokasi Aset”.
- Description: “Kelola ruang, laboratorium, area penyimpanan, dan ruang servis inventaris.”
- CTA: “Tambah Lokasi”.
- Table/list responsif.

## 3. Table Columns

1. Nama lokasi.
2. Deskripsi.
3. Jumlah aset aktual bila API menyediakan.
4. Jumlah aset dialokasikan bila API menyediakan.
5. Aksi.

CTA detail: “Lihat aset di lokasi ini”.

## 4. Create/Edit Form

- Nama lokasi — required.
- Deskripsi — optional.
- Modal 520–560px.
- Contoh placeholder “Lab Komputer 1” atau “Ruang Servis”, bukan value default.

MVP tidak menambah field tipe lokasi. Pemilihan ruang servis dilakukan dari master lokasi yang ada sesuai kontrak backend pemeliharaan.

## 5. Delete Behavior

Lokasi tidak dapat dihapus bila masih digunakan sebagai:

- lokasi aktual aset;
- lokasi alokasi aktif;
- tujuan pengembalian aset yang sedang pemeliharaan;
- relasi lain yang dilindungi backend.

Tampilkan alert relasi dan CTA menuju detail lokasi/aset terkait. Jangan menawarkan force delete.

## 6. Search & Sorting

- Search nama/deskripsi.
- Sort alfabetis.
- Filter tidak diperlukan kecuali data besar.

## 7. Detail Lokasi

Setelah fitur alokasi aktif, detail mengikuti `design_location_asset_summary.md` dan membedakan:

- aset yang secara fisik berada di lokasi;
- aset yang dialokasikan ke lokasi tetapi sementara berada di ruang servis.

## 8. Responsive & Motion

- Mobile cards.
- Action menu mudah disentuh.
- Row update mendapat highlight singkat.
- Modal dan toast mengikuti global spec.

## 9. Acceptance Criteria

- CRUD lokasi dapat digunakan via keyboard.
- Delete relation error tidak menyebabkan data hilang.
- Lokasi yang menjadi tujuan alokasi/pengembalian terlindungi.
- USER tidak memiliki akses UI maupun route master lokasi.

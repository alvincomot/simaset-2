# Design Fitur Manajemen Aset

## 1. Tujuan

Memungkinkan `SUPER_ADMIN` dan `STAFF` menambah, mengubah, dan menghapus data dasar aset. Mutasi lifecycle alokasi dan pemeliharaan harus menggunakan fitur khusus, bukan form edit umum.

## 2. API

Kontrak aktif saat ini:

- `POST /api/assets`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`
- Master dropdown kategori dan lokasi.

Fitur alokasi menggunakan kontrak backend vNext yang harus diverifikasi terlebih dahulu.

## 3. Create Asset

### Form Fields

- Nama aset — required.
- Kategori — required searchable select.
- Lokasi aktual awal — required searchable select.
- Kondisi — `BAIK`/`RUSAK`; default mengikuti backend.

Informasi read-only:

- Kode aset dibuat otomatis oleh server.
- Status awal `TERSEDIA` dibuat otomatis oleh server.

Aset baru tidak otomatis `DIALOKASIKAN`. Gunakan fitur Alokasi setelah aset berhasil dibuat.

## 4. Edit Asset

Fields data dasar:

- Nama aset.
- Kategori.
- Kondisi, hanya bila backend mengizinkan.

Aturan lokasi:

- Untuk aset biasa `TERSEDIA`, perubahan lokasi aktual mengikuti kontrak backend.
- Untuk aset `DIALOKASIKAN`, jangan mengubah lokasi melalui edit umum; gunakan Relokasi.
- Untuk aset `PEMELIHARAAN`, lokasi aktual dikelola alur Pemeliharaan.

Read-only pada form umum:

- Kode aset.
- Status ketersediaan.
- Lokasi alokasi.

Jangan menyediakan dropdown status umum yang memungkinkan melewati aturan bisnis.

## 5. Delete Asset

### Confirm Dialog

- Title: “Hapus aset?”
- Sebut nama dan kode aset.
- Jelaskan aksi tidak dapat dibatalkan.
- Tombol destructive “Hapus aset”.

### Proteksi

Aset tidak dapat dihapus bila memiliki:

- riwayat peminjaman;
- alokasi aktif;
- proses pemeliharaan aktif;
- relasi audit yang oleh backend dinyatakan harus dipertahankan.

Tampilkan alasan spesifik dari backend. Jangan menawarkan force delete atau menghapus relasi dari client.

## 6. Form Layout

- Desktop: modal 600px.
- Mobile: full-screen dialog.
- Sections: Informasi Dasar, Penempatan Aktual, Kondisi.
- Informasi alokasi muncul sebagai read-only summary bila ada.

## 7. Validation

- Nama tidak boleh kosong setelah trim.
- Kategori/lokasi harus valid.
- Kondisi hanya enum backend.
- Server validation dipetakan ke field jika memungkinkan.

## 8. Loading & Error

- Master dropdown loading skeleton.
- Submit loading mempertahankan dialog.
- Error global mempertahankan input.
- Conflict status menampilkan refresh action.

## 9. Acceptance Criteria

- Kode dan status awal tidak dapat diedit saat create.
- Aset baru tidak langsung dialokasikan.
- Lokasi aset dialokasikan tidak diubah dari form edit umum.
- Semua lifecycle menggunakan aksi khusus.
- Error relasi delete tampil jelas.
- USER tidak dapat membuka form melalui route langsung.

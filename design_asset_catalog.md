# Design Fitur Katalog Aset

## 1. Tujuan

Menampilkan inventaris sesuai tujuan role:

- `SUPER_ADMIN`/`STAFF`: melihat seluruh aset individual untuk pengelolaan.
- `USER`: mencari aset yang dapat dipinjam dan, secara opsional, melihat ringkasan fasilitas yang dialokasikan ke ruangan.

Untuk aturan alokasi, baca `allocation_business_rules.md` dan `design_allocated_asset_catalog.md`.

## 2. API

Kontrak aktif saat ini:

- `GET /api/assets`
- `GET /api/assets/:id`

Fitur katalog Dialokasikan untuk User hanya boleh diaktifkan setelah backend menyediakan data aman dan teragregasi sebagaimana `design_allocation_backend_requirements.md`. Jangan menggunakan endpoint Admin lalu menyembunyikan field di client.

## 3. Admin/Staff View

### Page Header

- Title: “Aset Inventaris”.
- Description: jumlah data yang sedang ditampilkan.
- Primary CTA: “Tambah Aset”.

### Toolbar

- Search kode/nama aset.
- Filter kategori.
- Filter lokasi aktual.
- Filter lokasi alokasi setelah capability tersedia.
- Filter status ketersediaan, termasuk `DIALOKASIKAN` setelah backend aktif.
- Filter kondisi.
- Reset filters.
- Toggle view table/card opsional; default table.

### Table Columns

1. Kode Aset.
2. Nama Aset.
3. Kategori.
4. Lokasi Aktual.
5. Lokasi Alokasi bila relevan.
6. Kondisi.
7. Ketersediaan.
8. Aksi.

Behavior:

- Sticky header.
- Kode aset copyable melalui icon button dengan toast.
- Klik row membuka detail drawer.
- Kebab menu menampilkan aksi yang benar-benar didukung dan eligible.
- Aksi alokasi/relokasi/pemeliharaan mengikuti feature gate dan dokumen fitur masing-masing.
- Jangan tampilkan “Pinjam” untuk Admin/Staff; backend request khusus `USER`.

## 4. User View

Default berupa card grid untuk aset `TERSEDIA`:

- Thumbnail abstrak/icon berdasarkan kategori.
- Nama aset.
- Kode aset untuk aset yang dapat dipinjam, bila aman dan response menyediakan.
- Kategori dan lokasi.
- Badge “Tersedia”.
- Badge kondisi.
- CTA “Lihat detail”.

Search field menjadi elemen dominan. Filter kategori/lokasi menggunakan chips/popover.

Setelah fitur alokasi aktif, tambahkan filter status User:

- Tersedia — default.
- Dialokasikan — opt-in.

Saat Dialokasikan dipilih, gunakan tampilan ringkasan terkelompok sesuai `design_allocated_asset_catalog.md`, bukan card individual.

## 5. Asset Detail Drawer/Page

### Informasi Utama Admin/Staff

- Nama aset dan kode.
- Ketersediaan + kondisi.
- Kategori.
- Lokasi aktual.
- Lokasi alokasi bila ada.
- Metadata yang benar-benar tersedia pada response.

### Actions by Role

- Admin/Staff: Edit, Hapus, dan aksi lifecycle yang tersedia/eligible.
- User: “Ajukan Peminjaman” hanya bila aset `TERSEDIA` dan kondisi `BAIK`.
- Aset `DIALOKASIKAN`, `DIPINJAM`, atau `PEMELIHARAAN` tidak memiliki CTA pinjam.

Riwayat peminjaman/alokasi internal tidak ditampilkan kepada User.

## 6. Responsive Rules

- Desktop Admin/Staff: table.
- Tablet: table dengan kolom prioritas.
- Mobile: stacked cards dengan action menu.
- User tersedia: 4 kolom desktop besar, 3 desktop, 2 tablet, 1 mobile.
- User dialokasikan: grouped cards, bukan table individual.

## 7. Search & Filter Behavior

- Debounce 350ms.
- Search client-side hanya bila endpoint belum mendukung query dan dataset yang diterima memang sesuai role.
- Filter state disimpan di URL.
- Tampilkan chips filter aktif.
- Empty state membedakan “belum ada aset” dan “tidak ada hasil filter”.

## 8. Loading & Error

- Table skeleton 8 baris Admin/Staff.
- Card skeleton 8 item User.
- Detail drawer memiliki skeleton sendiri.
- Fetch detail gagal tidak menutup drawer; tampilkan retry.
- Kegagalan memuat ringkasan Dialokasikan tidak boleh mengganggu katalog Tersedia.

## 9. Micro-interactions

- Card hover: icon tile scale 1.03, card translateY -2px.
- Filter chips animate in/out 160ms.
- Drawer slide 240ms.
- Copy code menampilkan check sementara.

## 10. Acceptance Criteria

- User melihat aset Tersedia secara default.
- Dialokasikan hanya muncul setelah filter eksplisit dan backend capability aktif.
- User tidak melihat kode individual atau data internal aset dialokasikan.
- Filter dan search dapat dikombinasikan.
- Detail aset dapat dibuka dari keyboard.
- Status dan kondisi memakai badge semantic global.
- Tidak ada data pribadi peminjam atau audit internal pada tampilan User.

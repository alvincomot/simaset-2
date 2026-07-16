# Backend Gaps & Frontend Constraints

Dokumen ini mencegah agent frontend membuat aksi palsu atau mengasumsikan endpoint yang belum tersedia.

## 1. Fitur PRD yang Belum Tercermin dalam Ringkasan Endpoint

### Manajemen User

PRD menyebut Super Admin dapat menambah user, tetapi ringkasan backend tidak mencantumkan endpoint CRUD user.

Keputusan frontend MVP:

- Jangan tampilkan halaman Manajemen User aktif.
- Jangan membuat mock action yang tampak production-ready.
- Boleh sisakan route/file feature flag untuk implementasi berikutnya, default nonaktif.

Endpoint minimum yang dibutuhkan kelak:

```text
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id atau status activation
```

### Reject / Cancel Borrowing

Backend hanya memiliki approve dan return.

- Jangan tampilkan tombol Reject pada Staff/Admin.
- Jangan tampilkan tombol Cancel pada User.
- Jangan implementasikan perubahan status lokal tanpa API.

### Manual Maintenance Status

Enum aset memiliki `PEMELIHARAAN`, tetapi ringkasan `PUT /api/assets/:id` hanya menyebut nama, relasi, dan kondisi.

- Status ketersediaan ditampilkan read-only.
- Jangan memberikan dropdown status manual.
- Untuk mendukung maintenance workflow dibutuhkan endpoint atau field update yang eksplisit.

### Pengadaan / Barang Keluar

PRD menyebut pencatatan barang masuk dan keluar, tetapi API yang tersedia merepresentasikan create/delete aset, bukan modul pengadaan/penghapusan formal.

- Label UI gunakan “Tambah Aset” dan “Hapus Aset”.
- Jangan membuat nomor dokumen pengadaan, vendor, harga, atau approval penghapusan.

### Reporting / Export

PRD menyebut laporan pada hak akses Super Admin, tetapi endpoint laporan/export belum disebutkan.

- Dashboard dan list dapat menjadi laporan operasional visual.
- Jangan mengaktifkan export CSV/PDF tanpa spesifikasi dan kontrak data.



### Asset Allocation vNext

Keputusan bisnis alokasi telah disetujui, tetapi ringkasan backend aktif belum menyediakan seluruh kontraknya.

Sampai backend diperbarui dan diuji:

- jangan menambahkan `DIALOKASIKAN` hanya di frontend;
- jangan menyimpan lokasi alokasi di local state/local storage;
- jangan mengizinkan relokasi atau pemeliharaan melalui update field generik;
- jangan menampilkan katalog Dialokasikan kepada User menggunakan endpoint Admin;
- gunakan feature gate default nonaktif.

Dokumen acuan:

- `allocation_business_rules.md`
- `design_allocation_backend_requirements.md`
- seluruh `design_*allocation*.md` dan `design_asset_maintenance.md`.


## 2. Server-Owned Fields

Frontend tidak boleh meminta pengguna mengisi atau memodifikasi sembarangan:

- `kodeAset`: generated server.
- Status awal aset: `TERSEDIA`.
- `tanggalPinjam`: server-owned sesuai flow.
- Status awal borrowing: `PENDING`.
- Status setelah approve: `AKTIF`.
- `tanggalKembali` dan status `SELESAI`: ditetapkan saat return.
- Perubahan asset `DIPINJAM`/`TERSEDIA`: side effect backend borrowing.

## 3. Foreign-Key Errors

### Delete Asset

`400` bila memiliki riwayat peminjaman.

UI message:

> Aset tidak dapat dihapus karena memiliki riwayat peminjaman.

### Delete Category/Location

`400` bila masih dipakai aset.

UI message:

> Data tidak dapat dihapus karena masih digunakan oleh aset. Pindahkan aset terkait terlebih dahulu.

## 4. Authorization

Jangan hanya mengandalkan hidden menu. Terapkan:

- Route guard frontend.
- Backend tetap menjadi sumber kebenaran.
- Handle `403` dengan Forbidden page.
- Jangan retry otomatis request yang jelas ditolak karena role.

## 5. Data Shape Uncertainty

Sebelum implementasi final, agent harus membaca response aktual atau dokumentasi controller untuk memastikan:

- Nama key pada `/api/assets/stats`.
- Nama key JWT dan user pada login response.
- Payload forgot/reset password.
- Apakah `GET /api/assets` mendukung query pagination/filter.
- Struktur relasi category/location/borrowing.
- Apakah `catatan` menyimpan catatan request, return, atau ditimpa.

Buat adapter/normalizer API agar komponen UI tidak tergantung langsung pada variasi nama field.

## 6. Feature Flag Recommendations

```ts
const features = {
  userManagement: false,
  borrowingRejection: false,
  borrowingCancellation: false,
  manualMaintenance: false,
  reportsExport: false,
  assetAllocation: false,
  assetRelocation: false,
  allocatedCatalog: false,
  allocationMaintenance: false,
  allocationHistory: false,
};
```

## 7. Acceptance Criteria

- Tidak ada tombol aktif tanpa endpoint.
- Semua server-owned fields read-only atau hidden.
- Error relasi diterjemahkan ke pesan yang actionable.
- Agent tidak mengubah backend hanya untuk menyesuaikan desain tanpa permintaan eksplisit.

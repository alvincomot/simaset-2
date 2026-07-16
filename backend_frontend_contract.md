# Backend–Frontend Contract Map

## Authentication

| Method | Endpoint | Role | UI |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/forgot-password` | Public | Forgot Password |
| POST | `/api/auth/reset-password/:token` | Public | Reset Password |

## Assets

| Method | Endpoint | Role | UI |
|---|---|---|---|
| GET | `/api/assets/stats` | Auth, verifikasi policy backend | Dashboard summary |
| GET | `/api/assets` | Auth; USER dibatasi tersedia | Catalog/list |
| GET | `/api/assets/:id` | Auth | Asset detail |
| POST | `/api/assets` | SUPER_ADMIN, STAFF | Create asset |
| PUT | `/api/assets/:id` | SUPER_ADMIN, STAFF | Edit asset |
| DELETE | `/api/assets/:id` | SUPER_ADMIN, STAFF | Delete asset |

## Master Data

| Method | Endpoint | Role | UI |
|---|---|---|---|
| GET/POST/PUT/DELETE | `/api/masters/categories` | SUPER_ADMIN, STAFF | Category CRUD |
| GET/POST/PUT/DELETE | `/api/masters/locations` | SUPER_ADMIN, STAFF | Location CRUD |

Untuk update/delete, gunakan pola `/:id` sesuai routing backend aktual.

## Borrowing

| Method | Endpoint | Role | Side Effect |
|---|---|---|---|
| POST | `/api/borrowing/request` | USER | Borrowing → PENDING |
| GET | `/api/borrowing` | Auth | USER hanya miliknya; admin/staff semua |
| POST | `/api/borrowing/approve/:id` | SUPER_ADMIN, STAFF | Borrowing → AKTIF; Asset → DIPINJAM |
| POST | `/api/borrowing/return/:id` | SUPER_ADMIN, STAFF | Borrowing → SELESAI; tanggalKembali; asset status/kondisi diperbarui |

## Central Formatting

```ts
export const labels = {
  BAIK: 'Baik',
  RUSAK: 'Rusak',
  TERSEDIA: 'Tersedia',
  DIPINJAM: 'Dipinjam',
  PEMELIHARAAN: 'Pemeliharaan',
  PENDING: 'Pending',
  AKTIF: 'Aktif',
  SELESAI: 'Selesai',
};
```

## API Client Rules

- Base URL dari environment variable.
- Semua protected request memakai Bearer token.
- Normalisasi error ke struktur: `status`, `message`, `fieldErrors`, `raw`.
- Jangan menampilkan raw stack trace.
- Gunakan AbortController untuk search/detail request yang dibatalkan.
- Mutation harus invalidasi cache list/detail terkait.


## Allocation vNext — Contract Pending

Status `DIALOKASIKAN` dan lifecycle terkait telah disetujui secara bisnis, tetapi nama endpoint final belum ditetapkan pada dokumen ini.

Frontend hanya boleh mengaktifkan fitur setelah backend menyediakan dan mendokumentasikan operasi nyata untuk:

- alokasi single dan bulk;
- relokasi atomik;
- masuk pemeliharaan;
- selesai pemeliharaan dan kembali ke lokasi alokasi;
- riwayat alokasi;
- ringkasan fasilitas dialokasikan yang aman untuk User.

Jangan membuat atau memanggil endpoint placeholder. Baca `design_allocation_backend_requirements.md`.

Tambahkan label UI setelah backend aktif:

```ts
DIALOKASIKAN: 'Dialokasikan'
```

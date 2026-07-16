# Prompt Eksekusi Penuh Antigravity — Frontend SIMASET

Salin seluruh prompt di bawah ini ke Antigravity. Jalankan dari root repository frontend dan pastikan folder `SIMASET_Antigravity_Design_Specs` tersedia di dalam workspace.

---

Anda bertindak sebagai **Senior Frontend Engineer, UI/UX Engineer, dan QA Engineer** untuk membangun frontend production-ready proyek:

**SIMASET — Sistem Informasi Manajemen Aset Operasional & Inventaris**

Frontend menggunakan **React + Tailwind CSS** dan wajib terintegrasi dengan Backend REST API SIMASET yang sudah selesai. Kerjakan implementasi secara menyeluruh, bertahap, konsisten, dan jangan keluar dari konteks dokumen spesifikasi.

## 1. Instruksi Utama yang Tidak Boleh Dilanggar

1. Jangan mengubah backend, database, Prisma schema, endpoint, enum, field, role, atau alur bisnis.
2. Jangan membuat endpoint, data, tombol, menu, workflow, atau kemampuan yang tidak tersedia di backend.
3. Jangan mengganti keputusan desain dengan template admin generik.
4. Jangan mengabaikan dokumen `.md` yang tersedia.
5. Jangan menampilkan tindakan yang tidak diizinkan oleh role pengguna.
6. Jangan mengirim nilai label UI ke API. Nilai API harus menggunakan enum backend asli.
7. Jangan menampilkan raw error, stack trace, JWT, password, reset token, atau data sensitif pada console maupun UI.
8. Jangan menggunakan mock action seolah-olah berfungsi. Integrasikan semua aksi aktif ke endpoint nyata.
9. Jangan melakukan optimistic update pada proses approve dan return.
10. Jangan menganggap bentuk response API tanpa memeriksa dokumentasi/controller/response aktual. Gunakan adapter atau normalizer.
11. Jangan berhenti hanya setelah membuat layout statis. Semua halaman harus memiliki state, validasi, integrasi API, RBAC, responsivitas, dan feedback.
12. Jangan menulis warna secara ad-hoc jika token sudah tersedia.
13. Jangan mengubah file design specification. Perlakukan semua dokumen tersebut sebagai sumber kebenaran read-only.
14. Jangan menambahkan library besar tanpa alasan jelas. Gunakan dependency yang sudah ada terlebih dahulu.
15. Jangan melakukan migrasi framework atau bahasa proyek tanpa kebutuhan. Ikuti struktur repository yang sudah ada.
16. Jangan mengaktifkan fitur alokasi vNext sebelum backend capability diverifikasi. Tidak boleh membuat endpoint placeholder atau memalsukan status/lokasi di frontend.

Apabila terdapat konflik, gunakan urutan prioritas berikut:

1. Kontrak dan perilaku backend aktual.
2. `design_backend_gaps_and_constraints.md`.
3. `backend_frontend_contract.md`.
4. `design_system_global.md`.
5. `design_app_shell_rbac.md`.
6. Dokumen desain fitur terkait.
7. PRD.

Jika detail belum tersedia, jangan mengarang. Pilih implementasi paling konservatif, catat asumsi secara eksplisit, dan buat kode mudah disesuaikan melalui adapter/configuration layer.

## 2. Dokumen yang Wajib Dibaca Sebelum Coding

Baca seluruh dokumen berikut dari awal sampai akhir:

- `README.md`
- `design_system_global.md`
- `design_app_shell_rbac.md`
- `backend_frontend_contract.md`
- `design_backend_gaps_and_constraints.md`
- `design_auth_login.md`
- `design_auth_forgot_password.md`
- `design_auth_reset_password.md`
- `design_dashboard.md`
- `design_asset_catalog.md`
- `design_asset_management.md`
- `design_master_categories.md`
- `design_master_locations.md`
- `design_borrowing_request.md`
- `design_borrowing_approval.md`
- `design_asset_return.md`
- `design_borrowing_history.md`
- `allocation_business_rules.md`
- `design_allocation_backend_requirements.md`
- `design_asset_allocation.md`
- `design_asset_relocation.md`
- `design_asset_maintenance.md`
- `design_location_asset_summary.md`
- `design_allocated_asset_catalog.md`
- `design_allocation_history.md`

Setelah membaca, buat checklist implementasi yang memetakan:

- halaman dan route;
- komponen reusable;
- endpoint yang digunakan;
- role yang diizinkan;
- loading, empty, error, dan success state;
- validasi form;
- perilaku desktop, tablet, dan mobile;
- acceptance criteria dari setiap file desain.

Jangan mulai membuat halaman fitur sebelum foundation dan app shell selesai.

## 3. Konteks Produk dan Role

Role backend yang valid hanya:

- `SUPER_ADMIN`
- `STAFF`
- `USER`

Label UI:

- `SUPER_ADMIN` → Super Admin
- `STAFF` → Staff Inventaris
- `USER` → Mahasiswa/Dosen

Hak akses:

### SUPER_ADMIN

Akses penuh hanya pada fitur yang didukung endpoint: dashboard, katalog dan CRUD aset, kategori, lokasi, persetujuan pinjaman, proses pengembalian, serta seluruh riwayat peminjaman.

### STAFF

Akses operasional: dashboard, katalog dan CRUD aset, kategori, lokasi, persetujuan pinjaman, proses pengembalian, serta seluruh riwayat peminjaman.

### USER

Hanya boleh:

- melihat aset berstatus `TERSEDIA`;
- melihat detail aset yang boleh diakses;
- mengajukan peminjaman;
- melihat pinjaman dan riwayat miliknya sendiri.

RBAC wajib diterapkan pada:

- menu dan navigasi;
- route guard;
- visibility/action guard;
- pemanggilan API;
- halaman 403;
- redirect session.

Menyembunyikan menu saja tidak cukup.

## 4. Kontrak Enum yang Tidak Boleh Diubah

Gunakan value berikut saat berkomunikasi dengan API:

### Kondisi aset

- `BAIK`
- `RUSAK`

### Status ketersediaan

- `TERSEDIA`
- `DIPINJAM`
- `PEMELIHARAAN`

### Status peminjaman

- `PENDING`
- `AKTIF`
- `SELESAI`

### Status vNext yang Disetujui

- `DIALOKASIKAN`

Status ini hanya boleh dikirim setelah backend aktual mendukungnya. Sebelum itu, fitur terkait tetap nonaktif.

Label manusiawi hanya untuk tampilan:

```ts
const enumLabels = {
  BAIK: 'Baik',
  RUSAK: 'Rusak',
  TERSEDIA: 'Tersedia',
  DIPINJAM: 'Dipinjam',
  PEMELIHARAAN: 'Pemeliharaan',
  DIALOKASIKAN: 'Dialokasikan', // gunakan hanya setelah backend vNext aktif
  PENDING: 'Pending',
  AKTIF: 'Aktif',
  SELESAI: 'Selesai',
};
```

## 5. Endpoint Backend yang Boleh Digunakan

### Autentikasi

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`

### Aset

- `GET /api/assets/stats`
- `GET /api/assets`
- `GET /api/assets/:id`
- `POST /api/assets`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`

### Master kategori

- `GET /api/masters/categories`
- `POST /api/masters/categories`
- `PUT /api/masters/categories/:id`
- `DELETE /api/masters/categories/:id`

### Master lokasi

- `GET /api/masters/locations`
- `POST /api/masters/locations`
- `PUT /api/masters/locations/:id`
- `DELETE /api/masters/locations/:id`

### Peminjaman

- `POST /api/borrowing/request`
- `GET /api/borrowing`
- `POST /api/borrowing/approve/:id`
- `POST /api/borrowing/return/:id`

Base URL harus berasal dari environment variable. Jangan hardcode host backend. Ikuti konvensi environment milik proyek; untuk Vite gunakan `VITE_API_BASE_URL` jika belum ada konvensi lain.

## 6. Fitur yang Dilarang Diaktifkan

Backend saat ini belum menyediakan kontrak untuk fitur berikut, sehingga jangan membuat UI aktif untuk:

- CRUD/manajemen user;
- reject peminjaman;
- cancel peminjaman;
- perubahan manual status `PEMELIHARAAN`;
- export CSV/PDF;
- notifikasi real-time;
- modul vendor/pengadaan formal;
- depresiasi aset;
- approval penghapusan;
- pencatatan harga pembelian;
- endpoint laporan khusus.

Gunakan feature flags default `false` bila perlu menyiapkan struktur masa depan:

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

Jangan tampilkan menu atau tombol fitur nonaktif pada UI production.

## 6A. Fase Alokasi vNext

Fitur berikut sudah disetujui secara bisnis tetapi hanya dikerjakan bila backend aktual telah menyediakan capability yang lengkap:

- alokasi single dan bulk;
- relokasi atomik;
- pemeliharaan dengan lokasi aktual dan lokasi alokasi terpisah;
- katalog User Dialokasikan secara opt-in dan teragregasi;
- riwayat alokasi;
- ringkasan aset per lokasi.

Sebelum mengimplementasikan, verifikasi seluruh persyaratan pada `design_allocation_backend_requirements.md`. Bila salah satu kontrak inti belum tersedia, pertahankan feature flags `false`, jangan tampilkan menu, dan catat blocker. Jangan mengubah backend kecuali user secara eksplisit meminta pekerjaan backend.

## 7. Field yang Dikendalikan Server

Field berikut tidak boleh diminta atau diedit sembarangan oleh pengguna:

- `kodeAset` dibuat otomatis oleh server;
- status awal aset adalah `TERSEDIA`;
- `tanggalPinjam` ditetapkan oleh server/alur transaksi;
- status awal peminjaman adalah `PENDING`;
- approve mengubah status menjadi `AKTIF` dan aset menjadi `DIPINJAM`;
- return menetapkan `tanggalKembali`, status `SELESAI`, kondisi aset, dan ketersediaan aset;
- status ketersediaan aset ditampilkan read-only kecuali backend secara eksplisit mendukung update.

## 8. Target Visual Wajib

Bangun UI yang:

- modern;
- premium;
- clean;
- vibrant tetapi tidak berlebihan;
- terasa seperti aplikasi SaaS operasional modern, bukan admin template lama;
- konsisten di light dan dark mode;
- responsif di mobile, tablet, laptop, dan desktop.

Gunakan seluruh token pada `design_system_global.md` sebagai sumber kebenaran untuk:

- primary, secondary, accent, background, surface, border, dan text colors;
- semantic colors/status badges;
- typography;
- radius;
- shadow;
- spacing;
- focus ring;
- transition dan animation timing.

Arah visual:

- font utama: Plus Jakarta Sans atau Inter sesuai spesifikasi;
- primary: indigo;
- secondary: cyan;
- accent: violet;
- glassmorphism hanya sebagai aksen terbatas pada top bar/modal/hero;
- soft shadows dan border halus;
- whitespace yang cukup;
- data table tetap jelas dan efisien;
- hindari gradient berlebihan, glow berlebihan, dan animasi yang mengganggu.

## 9. Struktur Frontend

Pertahankan struktur repository yang ada. Jika proyek masih kosong, gunakan struktur modular berikut sebagai acuan:

```text
src/
  app/
  components/
    ui/
    layout/
    data-display/
    feedback/
  features/
    auth/
    dashboard/
    assets/
    masters/
    borrowing/
  lib/
    api/
    auth/
    constants/
    formatters/
    validators/
  routes/
  styles/
```

Wajib tersedia secara terpusat:

- API client;
- token/session manager;
- auth context/store;
- route guard;
- role/action guard;
- error normalizer;
- response adapter;
- enum labels dan badge mapping;
- date formatter;
- reusable button, badge, card, input, select, modal/dialog, table, skeleton, empty state, error state, toast, confirmation dialog, dan pagination/filter primitives sesuai kebutuhan nyata.

Jangan menduplikasi logika API dan styling di setiap halaman.

## 10. API dan State Handling

Implementasikan API client yang:

- menyisipkan `Authorization: Bearer <token>` pada protected request;
- mengambil base URL dari environment;
- menormalisasi error menjadi `status`, `message`, `fieldErrors`, dan `raw` internal;
- tidak menampilkan raw stack trace;
- menangani `401` secara terpusat;
- membersihkan token, user state, dan cache sensitif saat session berakhir;
- mencegah toast session-expired berulang;
- menampilkan halaman 403 untuk akses terlarang;
- mendukung pembatalan request menggunakan `AbortController` pada search/detail yang relevan;
- menghindari race condition;
- menginvalidasi/refetch list dan detail setelah mutation sukses.

Aturan mutation:

- disable tombol submit selama request;
- tampilkan progress/loading yang jelas;
- cegah double submit;
- pertahankan data form saat request gagal;
- jangan optimistic update untuk approve/return;
- setelah sukses, refetch data dari server;
- gunakan confirmation dialog untuk destructive action;
- terjemahkan error foreign key ke pesan yang actionable.

Pesan khusus:

- Delete aset `400`: **“Aset tidak dapat dihapus karena memiliki riwayat peminjaman.”**
- Delete kategori/lokasi `400`: **“Data tidak dapat dihapus karena masih digunakan oleh aset. Pindahkan aset terkait terlebih dahulu.”**
- Session `401`: **“Sesi Anda telah berakhir. Silakan masuk kembali.”**
- Forbidden `403`: tampilkan halaman tidak memiliki akses, bukan redirect loop.

## 11. Tata Letak Berdasarkan Role

### SUPER_ADMIN dan STAFF

- desktop/tablet besar: fixed/collapsible sidebar + sticky top bar;
- mobile: sidebar menjadi off-canvas drawer;
- menu: Dashboard, Aset, Permintaan Peminjaman, Peminjaman Aktif, Riwayat, Kategori, Lokasi;
- jangan tampilkan menu Manajemen User;
- status sidebar collapse dapat disimpan di local storage;
- top bar dapat memuat theme toggle dan profile menu;
- jangan tampilkan notification indicator jika tidak ada sumber data.

### USER

- desktop: navbar horizontal yang ringan;
- mobile: top app bar + bottom navigation maksimal empat item;
- fokus pada Katalog, Pencarian, Pinjaman Saya, Riwayat/Akun;
- UI lebih sederhana dan berorientasi katalog;
- beri padding bawah agar konten tidak tertutup bottom navigation.

## 12. Halaman yang Harus Diimplementasikan

Implementasikan sesuai route map dan design specs:

### Public/Auth

- Login NIM dan password.
- Forgot password.
- Reset password berdasarkan token URL.
- Invalid/expired token state.

### Admin/Staff

- Dashboard operasional.
- Daftar/katalog aset.
- Detail aset.
- Tambah aset.
- Edit aset.
- Hapus aset dengan proteksi relasi.
- CRUD kategori.
- CRUD lokasi.
- Daftar permintaan peminjaman `PENDING`.
- Approve peminjaman.
- Daftar peminjaman `AKTIF`.
- Proses pengembalian dengan kondisi kembali dan catatan.
- Riwayat peminjaman `SELESAI` serta tampilan semua transaksi sesuai spec.

### USER

- Katalog aset tersedia.
- Search dan filter yang benar-benar didukung data/API; bila backend belum mendukung query server, lakukan client-side secara transparan pada data yang sudah diambil dan jangan mengarang pagination server.
- Detail aset.
- Form permintaan peminjaman.
- Pinjaman saya.
- Riwayat pinjaman saya.

### System Pages

- Loading/session restore.
- Forbidden 403.
- Not Found 404.
- Global error boundary/fallback.

## 13. Urutan Eksekusi Wajib

Kerjakan secara berurutan:

### Fase 0 — Audit Repository

- periksa `package.json`, framework, TypeScript/JavaScript, router, Tailwind, linting, test setup, dan struktur folder;
- periksa cara menjalankan project;
- periksa apakah backend/controller atau dokumentasi response tersedia;
- jangan menghapus kode existing yang valid tanpa alasan.

### Fase 1 — Foundation

- design tokens;
- theme provider dan persistence;
- global styles;
- typography;
- UI primitives;
- toast, dialog, skeleton, empty state, error state;
- accessibility foundations.

### Fase 2 — API, Auth, dan RBAC

- API client;
- adapters/normalizers;
- token/session handling;
- auth pages;
- protected routes;
- role guards;
- 401/403/404 behavior.

### Fase 3 — App Shell

- Admin/Staff sidebar dan top bar;
- USER navbar dan bottom navigation;
- responsive layout;
- breadcrumbs/page headers bila relevan.

### Fase 4 — Dashboard

- cards statistik dari `/api/assets/stats`;
- visual ringkas sesuai data nyata;
- jangan membuat grafik dengan data palsu.

### Fase 5 — Assets

- catalog/list/detail;
- search/filter;
- create/edit/delete;
- role-based actions;
- relation error handling.

### Fase 6 — Master Data

- category CRUD;
- location CRUD;
- confirmation dan relation protection.

### Fase 7 — Borrowing USER

- request form;
- own active/pending/history views;
- server-owned fields tidak dapat diedit.

### Fase 8 — Borrowing Admin/Staff

- pending list;
- approval;
- active list;
- return processing;
- history.

### Fase 9 — Quality Pass

- responsive audit 320px, 375px, 768px, 1024px, 1280px, dan 1440px;
- light/dark audit;
- keyboard/focus audit;
- loading/empty/error/success audit;
- role audit;
- lint/build/test;
- browser verification.

Setelah satu fase selesai, periksa acceptance criteria terkait sebelum melanjutkan. Jangan melompati fase.

## 14. Core Component Requirements

Semua komponen harus mengikuti `design_system_global.md`.

### Buttons

- variants: primary, secondary, outline, ghost, destructive;
- ukuran konsisten;
- focus-visible ring;
- disabled dan loading state;
- minimum touch target mobile yang layak.

### Status Badges

- mapping warna terpusat;
- teks tetap terbaca pada light/dark;
- jangan hanya mengandalkan warna: gunakan label dan, bila sesuai, ikon kecil.

### Summary Cards

- hierarchy angka dan label jelas;
- hover lembut;
- icon container konsisten;
- skeleton yang mempertahankan layout.

### Data Tables

- search/filter yang jelas;
- sticky header bila bermanfaat;
- responsive strategy: horizontal scroll terkontrol atau card list pada mobile sesuai spec;
- empty dan error state;
- action menu yang keyboard-accessible;
- jangan menampilkan kolom yang tidak relevan untuk USER.

### Modals/Dialogs

- focus trap;
- escape to close bila aman;
- backdrop;
- initial focus;
- destructive confirmation yang eksplisit;
- cegah close tidak sengaja saat mutation berlangsung bila berisiko.

### Forms dan Date Pickers

- label selalu terlihat;
- validation message dekat field;
- required/optional state jelas;
- format tanggal lokal Indonesia;
- tenggat waktu tidak boleh menghasilkan tanggal tidak valid;
- pertahankan input saat API error;
- gunakan field yang benar-benar diterima backend.

### Toast/Alerts

- success, error, warning, info;
- pesan ringkas dan actionable;
- tidak menampilkan detail teknis sensitif;
- tidak menumpuk toast yang identik.

## 15. Micro-interactions dan Animation

Gunakan animasi halus dan fungsional:

- hover card: 160–200ms, sedikit elevation/translate;
- button press: scale sangat kecil dan tidak mengganggu;
- modal: fade + scale/slide 180–240ms;
- drawer: slide + backdrop fade sekitar 240ms;
- active navigation indicator: 160–200ms;
- skeleton shimmer yang lembut;
- toast enter/exit yang singkat;
- hindari layout shift;
- hormati `prefers-reduced-motion` dan nonaktifkan animasi non-esensial.

## 16. Accessibility Wajib

- semantic HTML;
- seluruh input memiliki label;
- tombol ikon memiliki accessible name;
- keyboard navigation berfungsi;
- focus-visible jelas;
- dialog memiliki focus trap;
- `aria-current` untuk menu aktif;
- `aria-expanded` untuk drawer/collapse;
- skip link ke konten utama;
- kontras warna cukup pada light/dark;
- error tidak hanya ditandai warna;
- focus berpindah secara masuk akal setelah navigasi/modal/action.

## 17. State Wajib di Setiap Halaman Data

Setiap halaman yang mengambil data wajib memiliki:

- initial loading skeleton;
- refetch/loading state yang tidak merusak layout;
- empty state dengan CTA yang sesuai role;
- recoverable error state dengan retry;
- forbidden state bila relevan;
- success feedback setelah mutation;
- disabled/loading state pada action;
- no-results state untuk search/filter.

## 18. Verifikasi dan Pengujian

Setelah implementasi:

1. Jalankan dependency install sesuai package manager repository.
2. Jalankan lint.
3. Jalankan type-check bila tersedia.
4. Jalankan unit/integration test yang tersedia.
5. Jalankan production build.
6. Perbaiki semua error dan warning yang material.
7. Jalankan aplikasi di browser.
8. Uji route public, protected, dan forbidden.
9. Uji ketiga role.
10. Uji loading, empty, error, success, serta double-submit prevention.
11. Uji light dan dark mode.
12. Uji viewport mobile sampai desktop.
13. Periksa horizontal overflow.
14. Periksa console browser agar tidak ada error runtime.
15. Ambil screenshot halaman utama pada light/dark dan mobile/desktop jika tool mendukung.

Jangan menyatakan selesai apabila build gagal, terdapat runtime error, route guard tidak bekerja, atau action aktif belum terhubung ke API.

## 19. Definition of Done Global

Frontend dianggap selesai hanya apabila:

- seluruh fitur yang didukung backend telah diimplementasikan;
- tidak ada fitur palsu atau endpoint rekaan;
- visual konsisten dengan seluruh design specs;
- UI modern, premium, clean, vibrant, tetapi tetap profesional;
- light/dark mode bekerja dan tersimpan;
- responsive pada viewport target;
- RBAC benar pada menu, route, dan action;
- USER tidak dapat melihat data pengguna lain;
- API error utama ditangani konsisten;
- semua server-owned fields aman;
- semua mutation mencegah double submit;
- loading, empty, error, success, dan no-results state tersedia;
- aksesibilitas dasar terpenuhi;
- tidak ada hardcoded token yang menyimpang;
- tidak ada TypeScript/ESLint/build error;
- tidak ada runtime error di browser;
- tidak ada horizontal overflow pada mobile;
- kode modular dan komponen reusable;
- README frontend menjelaskan setup environment dan perintah run/build.

## 20. Format Laporan Kerja

Sebelum coding, tampilkan secara ringkas:

1. hasil audit repository;
2. daftar dokumen yang telah dibaca;
3. implementation plan per fase;
4. risiko/ketidakpastian response API.

Kemudian kerjakan semua fase secara berurutan tanpa meminta persetujuan di setiap langkah, kecuali terdapat blocker nyata seperti file penting tidak tersedia, backend tidak dapat dijalankan, atau kontrak API saling bertentangan.

Setelah selesai, laporkan:

1. file utama yang dibuat/diubah;
2. route yang tersedia;
3. endpoint yang telah diintegrasikan;
4. RBAC yang diterapkan;
5. hasil lint/type-check/test/build;
6. hasil verifikasi browser;
7. asumsi yang masih tersisa;
8. fitur yang sengaja tidak dibuat karena belum didukung backend.

## 21. Perintah Mulai

Sekarang lakukan hal berikut:

1. Audit repository frontend.
2. Baca semua file design specification yang disebutkan.
3. Buat checklist dan implementation plan.
4. Implementasikan seluruh frontend SIMASET mengikuti urutan fase.
5. Integrasikan hanya endpoint yang tersedia.
6. Jalankan semua verifikasi.
7. Jangan keluar dari konteks, jangan mengarang fitur, dan jangan mengubah backend.

Mulai sekarang.

---

# Antigravity Master Prompt — Implementasi Frontend SIMASET

Gunakan prompt ini sebagai instruksi induk. Berikan satu dokumen fitur tambahan pada setiap task agar perubahan tetap terkontrol.

---

## Prompt

Anda akan membangun frontend production-ready untuk **SIMASET (Sistem Informasi Manajemen Aset Operasional & Inventaris)** menggunakan React dan Tailwind CSS.

### Sumber Kebenaran

1. PRD proyek.
2. Ringkasan endpoint backend.
3. `allocation_business_rules.md` untuk semua fitur alokasi.
4. `design_system_global.md`.
5. `design_app_shell_rbac.md`.
6. Dokumen `design_namafitur.md` yang sedang diimplementasikan.
7. `design_backend_gaps_and_constraints.md`.

Jangan menambah endpoint, field, role, atau workflow yang tidak tersedia. Fitur alokasi, relokasi, pemeliharaan teralokasi, katalog Dialokasikan, dan history alokasi harus tetap di balik feature gate sampai backend aktual mendukung seluruh capability pada `design_allocation_backend_requirements.md`. Jangan membuat endpoint placeholder.

### Target Visual

- Modern, premium, clean, vibrant.
- Plus Jakarta Sans/Inter.
- Light dan dark mode.
- Indigo sebagai primary, cyan secondary, violet accent.
- Soft shadows, rounded cards, glass accents terbatas.
- Micro-interactions yang halus dan mendukung reduced motion.
- Responsive desktop/tablet/mobile.

### Arsitektur Frontend

Buat struktur modular:

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
    allocation/       # hanya ketika feature gate aktif
    maintenance/      # hanya ketika feature gate aktif
  lib/
    api/
    auth/
    formatters/
    constants/
  routes/
  styles/
```

Gunakan:

- API client terpusat dengan Authorization Bearer token.
- Mapping enum dan badge terpusat.
- RoleGuard dan route-level authorization.
- Reusable loading, empty, error, dialog, table, card, dan toast components.
- URL query parameters untuk search/filter state bila relevan.

### Implementasi per Task

Untuk fitur yang diberikan:

1. Baca design spec seluruhnya.
2. Buat implementation plan singkat.
3. Identifikasi API endpoint dan role.
4. Implementasikan page, components, states, dan responsive behavior.
5. Tambahkan loading, empty, error, success.
6. Tambahkan keyboard/focus/accessibility.
7. Verifikasi light/dark mode.
8. Verifikasi mobile 320px, tablet, dan desktop.
9. Jalankan lint/build/test yang tersedia.
10. Gunakan browser untuk memverifikasi alur dan ambil screenshot hasil akhir.

### Aturan Mutasi Data

- Jangan optimistic update untuk approve dan return.
- Disable submit saat request berlangsung.
- Pertahankan input form saat error.
- Refresh/invalidate data setelah mutation sukses.
- Handle 400 relation error dengan message khusus.
- Handle 401 dengan logout/session expired flow.
- Handle 403 dengan Forbidden state.

### Definition of Done

- Tidak ada TypeScript/ESLint/build error.
- Tidak ada overflow horizontal pada mobile.
- Tidak ada hardcoded color di luar token.
- Semua action sesuai role dan endpoint.
- Loading/empty/error/success terlihat dan dapat diuji.
- Theme dan route guard berfungsi.
- UI tidak menampilkan data pengguna lain kepada role USER.
- Hasil akhir konsisten dengan design spec, bukan template admin generik.

---

## Pola Task yang Disarankan

```text
Implementasikan fitur [NAMA FITUR] untuk frontend SIMASET.
Gunakan design_system_global.md, design_app_shell_rbac.md,
design_backend_gaps_and_constraints.md, dan [FILE DESIGN FITUR].
Jangan mengubah backend. Buat plan, implementasikan, lalu verifikasi melalui browser.
```

## Build Order

1. Foundation: tokens, theme, UI primitives.
2. App shell dan RBAC.
3. Auth.
4. Dashboard.
5. Asset catalog dan asset management.
6. Master data.
7. Borrowing request.
8. Approval dan return.
9. History.
10. Allocation vNext setelah backend ready: allocation, relocation, maintenance, location summary, allocated catalog, history.
11. Final responsive/accessibility polish.

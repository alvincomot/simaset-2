# SIMASET — Frontend & Business Design Specifications

Dokumen dalam folder ini adalah spesifikasi desain dan implementasi untuk **SIMASET (Sistem Informasi Manajemen Aset Operasional & Inventaris)**. Seluruh dokumen disusun agar agent Antigravity bekerja per fitur, konsisten dengan role, kontrak backend, dan keputusan bisnis yang sudah disepakati.

## Prinsip Utama

1. Gunakan React + Tailwind CSS untuk frontend.
2. Backend adalah sumber kebenaran status, lokasi, otorisasi, dan mutasi.
3. Jangan membuat endpoint, field, atau aksi palsu.
4. Seluruh layar mendukung light/dark mode, responsif, aksesibel, dan memiliki loading/empty/error/success state.
5. Admin/Staff bersifat operasional dan data-dense; User berorientasi pencarian aset yang dapat dipinjam.
6. Fitur alokasi hanya aktif setelah backend capability dan kontrak aktual tersedia.

## Sumber Kebenaran Alokasi

Baca dalam urutan ini:

1. `allocation_business_rules.md`
2. `design_allocation_backend_requirements.md`
3. Dokumen fitur alokasi terkait.
4. `design_backend_gaps_and_constraints.md`
5. Kontrak backend aktual.

Keputusan inti:

- status baru `DIALOKASIKAN`;
- semi-permanen tanpa tenggat;
- satu aset satu lokasi alokasi aktif;
- hanya alokasi ke lokasi/ruangan;
- tidak dapat dipinjam;
- tidak muncul default pada katalog User;
- User melihat ringkasan terkelompok hanya setelah filter eksplisit;
- pemeliharaan mempertahankan lokasi alokasi dan mengubah lokasi aktual ke ruang servis;
- selesai servis kondisi Baik mengembalikan aset ke alokasi asal.

## Urutan Implementasi

### Foundation & Existing MVP

1. `design_system_global.md`
2. `design_app_shell_rbac.md`
3. `design_auth_login.md`
4. `design_auth_forgot_password.md`
5. `design_auth_reset_password.md`
6. `design_dashboard.md`
7. `design_asset_catalog.md`
8. `design_asset_management.md`
9. `design_master_categories.md`
10. `design_master_locations.md`
11. `design_borrowing_request.md`
12. `design_borrowing_approval.md`
13. `design_asset_return.md`
14. `design_borrowing_history.md`

### Allocation vNext — setelah Backend Ready

15. `allocation_business_rules.md`
16. `design_allocation_backend_requirements.md`
17. `design_asset_allocation.md`
18. `design_asset_relocation.md`
19. `design_asset_maintenance.md`
20. `design_location_asset_summary.md`
21. `design_allocated_asset_catalog.md`
22. `design_allocation_history.md`

### Governance

23. `backend_frontend_contract.md`
24. `design_backend_gaps_and_constraints.md`
25. `antigravity_master_prompt.md`
26. `antigravity_execute_all_prompt.md`

## Role

| Role Backend | Label UI | Hak Alokasi |
|---|---|---|
| `SUPER_ADMIN` | Super Admin | Alokasi, relokasi, pemeliharaan, seluruh history setelah backend ready |
| `STAFF` | Staff Inventaris | Operasional yang sama setelah backend ready |
| `USER` | Mahasiswa/Dosen | Melihat ringkasan Dialokasikan secara opt-in, tanpa aksi mutasi/peminjaman |

## Enum

### Aktif Saat Ini

- Kondisi: `BAIK`, `RUSAK`
- Ketersediaan: `TERSEDIA`, `DIPINJAM`, `PEMELIHARAAN`
- Peminjaman: `PENDING`, `AKTIF`, `SELESAI`

### Disetujui untuk Backend vNext

- Ketersediaan: `DIALOKASIKAN`

Jangan mengirim `DIALOKASIKAN` sebelum backend aktual mendukungnya.

## Dokumen Alokasi Baru

| Dokumen | Fokus |
|---|---|
| `allocation_business_rules.md` | Keputusan domain dan batas ruang lingkup |
| `design_asset_allocation.md` | Alokasi single dan bulk |
| `design_asset_relocation.md` | Pemindahan langsung antar-ruangan |
| `design_asset_maintenance.md` | Masuk servis dan kembali ke alokasi asal |
| `design_allocated_asset_catalog.md` | Filter opt-in dan ringkasan aman untuk User |
| `design_allocation_history.md` | Audit trail alokasi/pemeliharaan |
| `design_location_asset_summary.md` | Inventaris aktual vs alokasi per lokasi |
| `design_allocation_backend_requirements.md` | Capability backend minimum tanpa endpoint placeholder |

## Definition of Done Global

- Berfungsi desktop, tablet, mobile.
- Light/dark mode tervalidasi.
- Loading, empty, error, success tersedia.
- Route/action sesuai role.
- Tidak ada endpoint placeholder.
- Mutasi status/lokasi hanya dianggap sukses setelah backend sukses.
- User tidak menerima data operasional internal.
- Focus, keyboard, label, dan kontras memenuhi aksesibilitas dasar.

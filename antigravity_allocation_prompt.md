# Prompt Antigravity — Implementasi Alokasi Aset SIMASET

Gunakan prompt ini hanya setelah backend alokasi vNext tersedia dan kontraknya telah diverifikasi.

---

Anda bertindak sebagai Senior Frontend Engineer dan QA Engineer untuk mengimplementasikan fitur alokasi aset SIMASET tanpa keluar dari keputusan bisnis.

## Dokumen Wajib

Baca seluruh file berikut sebelum coding:

1. `allocation_business_rules.md`
2. `design_allocation_backend_requirements.md`
3. `design_system_global.md`
4. `design_app_shell_rbac.md`
5. `backend_frontend_contract.md`
6. `design_backend_gaps_and_constraints.md`
7. `design_asset_allocation.md`
8. `design_asset_relocation.md`
9. `design_asset_maintenance.md`
10. `design_location_asset_summary.md`
11. `design_allocated_asset_catalog.md`
12. `design_allocation_history.md`
13. `design_asset_catalog.md`
14. `design_asset_management.md`
15. `design_master_locations.md`

## Aturan Mutlak

- Jangan membuat endpoint atau field placeholder.
- Verifikasi response backend aktual sebelum membuat adapter.
- Jangan mengaktifkan feature bila backend belum memenuhi capability minimum.
- Status API baru hanya `DIALOKASIKAN`; label UI “Dialokasikan”.
- Satu aset hanya memiliki satu lokasi alokasi aktif.
- Alokasi hanya untuk lokasi/ruangan, bukan orang, unit, organisasi, atau proyek.
- Aset dialokasikan tidak dapat dipinjam.
- User hanya melihat ringkasan Dialokasikan setelah filter eksplisit; jangan tampilkan kode aset individual.
- Relokasi harus utuh: lokasi lama diganti lokasi baru dalam satu mutation sukses.
- Saat pemeliharaan, pertahankan lokasi alokasi dan ubah lokasi aktual ke ruang servis.
- Selesai servis kondisi Baik mengembalikan aset ke lokasi alokasi.
- Kondisi masih Rusak harus tetap Pemeliharaan.
- Jangan optimistic update pada mutasi status/lokasi.
- Setiap perubahan harus menghasilkan audit history dari backend.

## Tahap Kerja

1. Audit kontrak backend aktual dan petakan capability.
2. Bila belum lengkap, berhenti pada laporan blocker dan biarkan feature flags false.
3. Bila lengkap, buat adapter API, enum mapping, eligibility helper, dan guards terpusat.
4. Implementasikan alokasi single dan bulk.
5. Implementasikan relokasi.
6. Implementasikan pemeliharaan masuk/selesai servis.
7. Implementasikan detail/ringkasan lokasi.
8. Implementasikan katalog User Dialokasikan teragregasi.
9. Implementasikan history read-only.
10. Integrasikan navigation hanya sesuai role dan feature gate.
11. Uji 401, 403, 400, 404, 409, 500, double submit, stale state, dan bulk partial result bila didukung.
12. Uji desktop, tablet, mobile, light/dark, keyboard, focus, dan reduced motion.
13. Jalankan lint, type-check, test, build, dan verifikasi browser.

## Definition of Done

- Tidak ada endpoint palsu atau data alokasi disimpan hanya di frontend.
- Semua status/lokasi berasal dari backend.
- User tidak dapat mengajukan pinjaman aset Dialokasikan, termasuk melalui direct request.
- User tidak menerima kode aset individual atau audit internal untuk fasilitas Dialokasikan.
- Aset dalam servis tetap terhubung ke lokasi alokasi asal.
- Relokasi dan penyelesaian servis tidak menimbulkan state parsial.
- Semua acceptance criteria pada masing-masing design file terpenuhi.

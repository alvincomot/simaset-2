# Design Fitur Ringkasan Aset per Lokasi

## 1. Tujuan

Membantu `SUPER_ADMIN` dan `STAFF` memahami inventaris dan fasilitas yang dialokasikan pada setiap ruangan tanpa harus mencari aset satu per satu.

Dokumen wajib dibaca bersama `allocation_business_rules.md`.

## 2. Entry Point

- Klik lokasi dari halaman Master Lokasi.
- CTA “Lihat aset di lokasi ini”.
- Widget atau link dari halaman Alokasi.

## 3. Location Detail Header

Tampilkan:

- nama lokasi;
- deskripsi;
- total aset aktual di lokasi;
- total aset dialokasikan ke lokasi;
- aset baik;
- aset rusak;
- aset sementara berada di pemeliharaan tetapi memiliki alokasi ke lokasi ini.

Jumlah hanya ditampilkan bila backend menyediakan agregasi atau data yang aman untuk dihitung. Jangan mengarang angka.

## 4. Dua Tab Utama

### Aset di Lokasi Saat Ini

Menjawab: “Aset apa yang secara fisik berada di ruangan ini sekarang?”

Termasuk aset dengan lokasi aktual sesuai lokasi tersebut.

### Dialokasikan ke Lokasi Ini

Menjawab: “Aset apa yang secara organisasi/operasional seharusnya kembali ke ruangan ini?”

Termasuk aset yang sedang di ruang servis tetapi lokasi alokasinya tetap lokasi ini.

Pemisahan tab penting agar komputer Lab 1 yang sedang diservis tidak hilang dari tanggung jawab inventaris Lab 1.

## 5. Group Summary

Di atas daftar individual, tampilkan ringkasan per kategori/nama aset:

- Komputer Desktop — 25 unit.
- Monitor — 25 unit.
- Proyektor — 2 unit.

Admin/Staff dapat membuka group untuk melihat aset individual dan kode unik.

## 6. Actions

- Alokasikan aset ke lokasi ini.
- Relokasi aset terpilih.
- Pindahkan aset ke pemeliharaan.
- Buka detail aset.

Semua aksi hanya tampil jika backend capability tersedia dan aset eligible.

## 7. Delete Location Protection

Lokasi tidak dapat dihapus apabila:

- masih menjadi lokasi aktual aset;
- masih menjadi lokasi alokasi aktif;
- masih menjadi tujuan pengembalian aset dalam pemeliharaan.

Error harus menjelaskan alasan dan memberi CTA untuk melihat aset terkait. Tidak ada force delete.

## 8. User Visibility

User tidak mengakses halaman operasional ini. User hanya melihat ringkasan fasilitas aman melalui `design_allocated_asset_catalog.md`.

## 9. Responsive

- Desktop: summary cards + table.
- Tablet: summary grid 2 kolom.
- Mobile: accordion group dan individual cards.
- Primary action dapat sticky di mobile.

## 10. Acceptance Criteria

- Lokasi aktual dan lokasi alokasi tidak dicampur.
- Aset dalam servis tetap terlihat pada tab alokasi asal.
- Admin/Staff dapat menelusuri group ke kode aset individual.
- Delete location terlindungi oleh relasi alokasi dan pemeliharaan.
- Semua angka berasal dari backend atau perhitungan data yang benar-benar tersedia.

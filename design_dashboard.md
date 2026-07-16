# Design Fitur Dashboard

## 1. Tujuan

Memberikan ringkasan kondisi inventaris dan pekerjaan yang perlu ditindaklanjuti tanpa mengarang data yang tidak tersedia dari backend.

## 2. API

- `GET /api/assets/stats` → Total Aset, Sedang Dipinjam, Rusak.
- `GET /api/assets` → distribusi kategori/lokasi/status dapat dihitung di frontend bila diperlukan.
- `GET /api/borrowing` → antrean pending, transaksi aktif, riwayat sesuai role.

## 3. Variant Admin/Staff

### Header

- Greeting berdasarkan waktu lokal: “Selamat pagi/siang/sore”.
- Subtext: “Pantau aset dan proses peminjaman hari ini.”
- Right actions: “Tambah Aset” dan optional refresh icon.

### Summary Row

Tiga kartu wajib sesuai endpoint stats:

1. Total Aset — icon Boxes.
2. Sedang Dipinjam — icon ArrowLeftRight.
3. Aset Rusak — icon TriangleAlert.

Klik kartu membuka `/assets` dengan filter UI yang relevan. Jangan tampilkan persentase perubahan karena API tidak menyediakannya.

### Operational Widgets

- **Permintaan Menunggu:** daftar maksimal 5 transaksi `PENDING`, CTA “Lihat semua”.
- **Peminjaman Aktif:** deadline terdekat, maksimal 5.
- **Distribusi Status Aset:** donut/bar sederhana dari data backend untuk `TERSEDIA`, `DIPINJAM`, `PEMELIHARAAN`, dan `DIALOKASIKAN` setelah capability alokasi aktif.
- **Aset Perlu Perhatian:** aset kondisi RUSAK atau status PEMELIHARAAN.

Layout desktop:

```text
Summary 3 columns
Left 8 cols: pending requests / active borrowings
Right 4 cols: status chart / attention list
```

Tablet menjadi 2 kolom; mobile satu kolom.

### Allocation vNext Widgets

Hanya setelah backend alokasi aktif:

- **Aset Dialokasikan:** jumlah total aset berstatus `DIALOKASIKAN`.
- **Dalam Pemeliharaan:** aset di ruang servis beserta lokasi alokasi tujuan.
- **Fasilitas per Lokasi:** ringkasan lokasi dengan jumlah aset dialokasikan terbesar.

Jangan mengganti tiga kartu stats wajib bila `/api/assets/stats` belum menyediakan angka baru. Widget tambahan harus gagal secara terisolasi dan tidak mengganggu dashboard utama.

## 4. Variant User

Dashboard user tidak perlu menampilkan statistik inventaris internal.

### Hero

- Heading: “Temukan aset yang siap dipinjam”.
- Search field besar.
- CTA menuju katalog.

### User Widgets

- Pinjaman aktif milik saya.
- Permintaan pending milik saya.
- Tenggat terdekat.
- Aset tersedia terbaru/populer hanya bila urutan dapat ditentukan; bila tidak, tampilkan beberapa hasil pertama dengan label “Aset tersedia”.

## 5. Chart Guideline

- Gunakan satu chart sederhana, maksimal 3–5 kategori.
- Legend selalu terlihat.
- Tooltip menampilkan label dan jumlah.
- Warna mengikuti semantic tokens.
- Sediakan text summary untuk aksesibilitas.
- Jangan menggunakan 3D chart.

## 6. Empty & Error States

- Tidak ada pending: icon check, “Semua permintaan sudah ditangani.”
- Tidak ada pinjaman aktif: message netral.
- Stats gagal tetapi borrowing berhasil: tampilkan widget lain dan error compact pada summary area.
- Full failure: ErrorState dengan retry.

## 7. Loading

- Tiga summary skeleton dengan tinggi sama.
- Widget skeleton meniru row list dan chart placeholder.
- Hindari layout shift saat data masuk.

## 8. Micro-interactions

- Summary cards muncul stagger 40–60ms.
- Hover card translateY -2px.
- Row pending menampilkan action reveal yang halus, tetapi tombol approve tetap terlihat pada perangkat touch.
- Refresh icon berputar selama fetch manual.

## 9. Acceptance Criteria

- Tiga statistik utama sama dengan response `/assets/stats`.
- User hanya melihat data peminjamannya sendiri.
- Dashboard tidak menampilkan trend palsu.
- Semua widget memiliki loading, empty, dan error state.
- Responsif dari 320px hingga desktop lebar.

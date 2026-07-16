# Design App Shell & Role-Based Navigation

## 1. Tujuan

Menyediakan struktur navigasi yang konsisten untuk tiga role backend: `SUPER_ADMIN`, `STAFF`, dan `USER`, termasuk route guard, responsive navigation, theme switcher, profile menu, serta perilaku sesi.

## 2. Route Map

### Super Admin

```text
/dashboard
/assets
/borrowings?status=PENDING
/borrowings?status=AKTIF
/borrowings/history
/masters/categories
/masters/locations
/allocations                 # hanya setelah feature gate aktif
/maintenance                 # hanya setelah feature gate aktif
/allocations/history         # hanya setelah feature gate aktif
```

Catatan: menu Manajemen User tidak diaktifkan sampai endpoint backend tersedia.

### Staff

```text
/dashboard
/assets
/borrowings?status=PENDING
/borrowings?status=AKTIF
/borrowings/history
/masters/categories
/masters/locations
/allocations                 # hanya setelah feature gate aktif
/maintenance                 # hanya setelah feature gate aktif
/allocations/history         # hanya setelah feature gate aktif
```

### User

```text
/home atau /assets
/assets/:id
/my-borrowings
/my-borrowings/history
```

## 3. Admin/Staff Desktop Layout

### Sidebar

- Lebar expanded: 264px.
- Lebar collapsed: 80px.
- Posisi fixed kiri, full height.
- Brand area tinggi 72px.
- Group navigation:
  - Overview: Dashboard.
  - Inventaris: Aset; Alokasi; Pemeliharaan (dua menu terakhir hanya ketika backend capability aktif).
  - Peminjaman: Permintaan, Sedang Aktif, Riwayat.
  - Master Data: Kategori, Lokasi.
- Active item memakai background indigo lembut, icon dan teks primary.
- Badge count pending boleh ditampilkan jika data sudah diambil dari `GET /api/borrowing`.
- Collapse state disimpan ke local storage.

### Top Bar

- Tinggi 72px.
- Sticky dengan glass blur.
- Kiri: tombol collapse mobile/desktop dan breadcrumb opsional.
- Kanan: theme toggle, notification indicator nonaktif/tidak ditampilkan bila tidak ada sumber data, avatar initials, role label.
- User menu: nama lengkap, NIM, role, toggle theme, keluar.

### Content

```text
margin-left: sidebar width
min-height: 100vh
background: app background
content max-width: 1440px
padding: 24px desktop / 16px mobile
```

## 4. Admin/Staff Mobile Layout

- Sidebar menjadi off-canvas drawer.
- Top app bar 64px dengan hamburger, page title, avatar.
- Primary action penting dapat menjadi sticky bottom action pada form atau floating button terbatas.
- Jangan gunakan bottom nav untuk Admin/Staff karena jumlah menu terlalu banyak.

## 5. User Desktop Layout

Navbar horizontal:

- Brand kiri.
- Nav tengah: Katalog, Pinjaman Saya, Riwayat.
- Kanan: theme toggle dan profile menu.
- CTA “Lihat Aset Tersedia” dapat muncul pada halaman kosong, bukan permanen di navbar.

Konten user memakai max-width 1280px dan visual lebih ringan daripada admin.

## 6. User Mobile Layout

Top app bar:

- Brand compact.
- Theme/profile action.

Bottom navigation fixed:

1. Beranda/Katalog.
2. Cari.
3. Pinjaman Saya.
4. Akun.

Riwayat dapat menjadi tab di Pinjaman Saya agar bottom navigation tidak lebih dari empat item.

Pastikan content memiliki padding bawah minimal 88px agar tidak tertutup bottom nav.

## 7. Route Guard Rules

| Route group | SUPER_ADMIN | STAFF | USER |
|---|:---:|:---:|:---:|
| Dashboard operasional | Ya | Ya | Tidak/variant user |
| CRUD aset | Ya | Ya | Tidak |
| Alokasi/relokasi aset | Ya* | Ya* | Tidak |
| Pemeliharaan teralokasi | Ya* | Ya* | Tidak |
| Katalog tersedia | Ya | Ya | Ya |
| Master kategori/lokasi | Ya | Ya | Tidak |
| Approve pinjaman | Ya | Ya | Tidak |
| Proses pengembalian | Ya | Ya | Tidak |
| Pinjaman sendiri | Ya | Ya | Ya, hanya data milik sendiri dari API |

Keterangan `*`: hanya setelah backend alokasi/pemeliharaan tersedia dan feature gate aktif.

Perilaku akses:

- Belum login → redirect `/login` dengan `returnTo` aman.
- Token tidak valid/expired → bersihkan session, toast “Sesi berakhir”, redirect login.
- `403` → halaman Forbidden, bukan redirect loop.
- Route tidak ada → halaman 404 dengan CTA kembali ke dashboard/katalog.

## 8. Session Handling

- JWT dikirim sebagai `Authorization: Bearer <token>`.
- Gunakan storage sesuai arsitektur aplikasi; jangan log token.
- Central API client menangani `401` sekali dan mencegah banyak toast duplikat.
- Logout menghapus token, user state, cache data sensitif, lalu redirect login.
- Tampilkan skeleton shell saat session sedang direstore.

## 9. Navigation Interactions

- Active route indicator bergerak halus 160–200ms.
- Sidebar tooltip muncul ketika collapsed.
- Mobile drawer memakai backdrop fade dan slide 240ms.
- Menu group dapat collapse, tetapi state penting tetap mudah ditemukan.
- Setelah navigasi mobile, drawer otomatis tertutup dan focus berpindah ke heading halaman.

## 10. Accessibility

- Navigation memakai `<nav aria-label="Navigasi utama">`.
- Tombol collapse memiliki `aria-expanded`.
- Active item memakai `aria-current="page"`.
- Mobile drawer memiliki focus trap.
- Skip link “Lewati ke konten utama” tampil saat focus.

## 11. Acceptance Criteria

- Menu berubah tepat sesuai role.
- User tidak dapat melihat route master data melalui UI.
- Direct URL ke route terlarang menghasilkan halaman 403.
- Sidebar tetap usable pada 1024px dan berubah drawer di bawah breakpoint yang dipilih.
- Bottom navigation user tidak menutupi konten.
- Theme preference dipertahankan setelah refresh.

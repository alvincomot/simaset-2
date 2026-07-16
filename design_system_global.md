# Design System Global — SIMASET

## 1. Arah Visual

SIMASET harus terasa sebagai produk kampus yang profesional, modern, premium, bersih, dan aktif. Hindari tampilan “admin template” lama yang penuh border keras, abu-abu kusam, dan tabel tanpa hierarki visual.

Karakter visual:

- **Clean foundation:** ruang putih cukup, struktur jelas, border tipis.
- **Vibrant accents:** indigo, cyan, dan violet digunakan terkendali.
- **Soft depth:** shadow halus dan glassmorphism hanya pada elemen penting.
- **Operational clarity:** status aset dan peminjaman dapat dipahami dalam satu pandangan.
- **Motion with purpose:** animasi mengonfirmasi aksi, bukan sekadar dekorasi.

## 2. Design Tokens

### 2.1 Brand Palette

| Token | Light HEX | Dark HEX | Tailwind utama | Penggunaan |
|---|---:|---:|---|---|
| Primary | `#4F46E5` | `#818CF8` | `indigo-600 / indigo-400` | CTA, active navigation, focus |
| Primary Hover | `#4338CA` | `#A5B4FC` | `indigo-700 / indigo-300` | Hover primary |
| Secondary | `#0891B2` | `#22D3EE` | `cyan-600 / cyan-400` | Grafik, secondary action |
| Accent | `#7C3AED` | `#A78BFA` | `violet-600 / violet-400` | Highlight dan aksen premium |
| Brand Soft | `#EEF2FF` | `#1E1B4B` | `indigo-50 / indigo-950` | Icon tile dan selected row |

### 2.2 Neutral & Surface Palette

| Token | Light | Dark | Tailwind |
|---|---:|---:|---|
| App Background | `#F8FAFC` | `#070B14` | `slate-50 / custom` |
| Surface | `#FFFFFF` | `#0F172A` | `white / slate-900` |
| Surface Elevated | `#FFFFFF` | `#111C31` | `white / custom` |
| Surface Muted | `#F1F5F9` | `#172033` | `slate-100 / custom` |
| Border | `#E2E8F0` | `#263247` | `slate-200 / custom` |
| Text Primary | `#0F172A` | `#F8FAFC` | `slate-900 / slate-50` |
| Text Secondary | `#475569` | `#CBD5E1` | `slate-600 / slate-300` |
| Text Muted | `#64748B` | `#94A3B8` | `slate-500 / slate-400` |

### 2.3 Semantic Status Colors

Gunakan badge dengan kombinasi latar lembut, teks lebih gelap, dot/icon solid. Jangan hanya mengandalkan warna; selalu tampilkan label dan bila perlu icon.

| Status | Light badge | Dark badge | Solid | Tailwind contoh |
|---|---|---|---|---|
| Tersedia | `#ECFDF5 / #047857` | `#052E24 / #6EE7B7` | `#10B981` | `bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300` |
| Dipinjam | `#EFF6FF / #1D4ED8` | `#0B2545 / #93C5FD` | `#3B82F6` | `bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300` |
| Pemeliharaan | `#FFFBEB / #B45309` | `#3A2505 / #FCD34D` | `#F59E0B` | `bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300` |
| Dialokasikan | `#F5F3FF / #6D28D9` | `#2E1065 / #C4B5FD` | `#8B5CF6` | `bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300` |
| Baik | `#F0FDFA / #0F766E` | `#042F2E / #5EEAD4` | `#14B8A6` | `bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300` |
| Rusak | `#FFF1F2 / #BE123C` | `#3F0A17 / #FDA4AF` | `#F43F5E` | `bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300` |
| Pending | `#FFF7ED / #C2410C` | `#431407 / #FDBA74` | `#F97316` | `bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300` |
| Aktif | `#EEF2FF / #4338CA` | `#1E1B4B / #A5B4FC` | `#6366F1` | `bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300` |
| Selesai | `#F0FDF4 / #15803D` | `#052E16 / #86EFAC` | `#22C55E` | `bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300` |
| Info | `#ECFEFF / #0E7490` | `#083344 / #67E8F9` | `#06B6D4` | info alerts |
| Warning | `#FFFBEB / #B45309` | `#3A2505 / #FCD34D` | `#F59E0B` | destructive warning |
| Error | `#FEF2F2 / #B91C1C` | `#450A0A / #FCA5A5` | `#EF4444` | error states |

### 2.4 CSS Variables yang Disarankan

```css
:root {
  --background: 248 250 252;
  --surface: 255 255 255;
  --surface-muted: 241 245 249;
  --border: 226 232 240;
  --text-primary: 15 23 42;
  --text-secondary: 71 85 105;
  --primary: 79 70 229;
  --secondary: 8 145 178;
  --accent: 124 58 237;
}

.dark {
  --background: 7 11 20;
  --surface: 15 23 42;
  --surface-muted: 23 32 51;
  --border: 38 50 71;
  --text-primary: 248 250 252;
  --text-secondary: 203 213 225;
  --primary: 129 140 248;
  --secondary: 34 211 238;
  --accent: 167 139 250;
}
```

## 3. Typography

Gunakan **Plus Jakarta Sans** sebagai font utama, dengan fallback `Inter, ui-sans-serif, system-ui`. Angka statistik dapat menggunakan `font-variant-numeric: tabular-nums` agar stabil.

| Style | Ukuran / Line-height | Weight | Tailwind |
|---|---|---|---|
| Display | 40 / 48 | 700 | `text-4xl font-bold tracking-tight` |
| H1 | 32 / 40 | 700 | `text-3xl font-bold tracking-tight` |
| H2 | 24 / 32 | 700 | `text-2xl font-bold` |
| H3 | 20 / 28 | 600 | `text-xl font-semibold` |
| H4 | 16 / 24 | 600 | `text-base font-semibold` |
| Body Large | 16 / 26 | 400 | `text-base leading-6` |
| Body | 14 / 22 | 400 | `text-sm leading-[22px]` |
| Label | 13 / 18 | 600 | `text-[13px] font-semibold` |
| Caption | 12 / 18 | 400 | `text-xs` |
| Small Tag | 11 / 16 | 600 | `text-[11px] font-semibold uppercase tracking-wide` |

Aturan:

- Maksimum dua weight dominan per layar: 400 dan 600/700.
- Jangan menggunakan uppercase untuk paragraf atau tombol panjang.
- Gunakan `tabular-nums` untuk kode aset, tanggal, dan statistik.

## 4. Spacing, Grid, Radius, Shadow

### Spacing System

Gunakan basis 4px: `1, 2, 3, 4, 5, 6, 8, 10, 12, 16` yang ekuivalen dengan 4–64px.

- Gap internal icon-label: 8px.
- Gap antar field form: 16px.
- Padding card: 20px mobile, 24px desktop.
- Jarak section: 24px mobile, 32px desktop.
- Container desktop: `max-w-[1440px]` dengan padding 24–32px.

### Grid

- Desktop admin: 12 kolom, gap 24px.
- Tablet: 8 kolom, gap 20px.
- Mobile: 4 kolom, gap 16px.
- Summary card: 3 kolom pada desktop, 2 tablet, 1 mobile.

### Radius

- Small controls: `rounded-lg` (8px).
- Inputs/buttons: `rounded-xl` (12px).
- Cards/modals: `rounded-2xl` (16px).
- Hero/glass panel: `rounded-3xl` (24px).
- Badge: `rounded-full`.

### Shadows

- Card default: `shadow-sm` + border.
- Hover card: `shadow-lg shadow-slate-900/5 dark:shadow-black/20`.
- Modal: `shadow-2xl shadow-slate-950/20`.
- Jangan memakai shadow tebal pada semua elemen.

## 5. Glassmorphism Guideline

Glassmorphism hanya untuk:

- Header sticky.
- Floating filter toolbar.
- Login visual panel.
- Modal backdrop panel tertentu.

Contoh:

```html
class="bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl border border-white/50 dark:border-slate-700/60"
```

Jangan gunakan glass effect pada seluruh table body karena menurunkan keterbacaan.

## 6. Core UI Components

### 6.1 Buttons

Ukuran standar tinggi 40px; besar 44–48px.

- **Primary:** indigo solid, text white, shadow tipis.
- **Secondary:** surface + border.
- **Tertiary/Ghost:** transparan, hover surface-muted.
- **Destructive:** rose/red, gunakan hanya pada konfirmasi final.
- **Icon Button:** 40×40, wajib `aria-label` dan tooltip.

State wajib: default, hover, active (`scale-[0.98]`), focus-visible, disabled, loading.

Loading button mempertahankan lebar, mengganti icon dengan spinner 16px, dan teks menjadi kata kerja progresif seperti “Menyimpan…”.

### 6.2 Status Badge

Anatomi: dot/icon 6–14px + label, tinggi 24–28px. Gunakan mapping enum terpusat.

```ts
const borrowingStatus = {
  PENDING: { label: 'Pending', tone: 'orange' },
  AKTIF: { label: 'Aktif', tone: 'indigo' },
  SELESAI: { label: 'Selesai', tone: 'green' },
};

// Tambahkan DIALOKASIKAN pada mapping asset availability setelah backend vNext aktif.
// Value API tetap 'DIALOKASIKAN'; label UI 'Dialokasikan'.
```

### 6.3 Summary Cards / Widgets

- Kicker label kecil.
- Nilai besar 28–36px.
- Icon dalam tile 40–48px.
- Optional helper text atau trend; jangan mengarang trend jika API tidak menyediakannya.
- Hover: translateY -2px dan shadow meningkat.
- Card dapat diklik hanya apabila jelas menuju daftar terfilter.

### 6.4 Data Tables

Struktur desktop:

1. Header section + primary action.
2. Toolbar search/filter.
3. Table container dengan sticky header.
4. Pagination/footer.

Aturan:

- Search menggunakan debounce 300–400ms.
- Filter ditampilkan sebagai chips aktif yang dapat dihapus.
- Kolom aksi menggunakan kebab menu agar tidak padat.
- Row hover lembut; selected row memakai brand soft.
- Kode aset memakai monospace ringan atau `tabular-nums`.
- Pada mobile, table berubah menjadi list cards; jangan memaksa horizontal scroll untuk semua kolom.

### 6.5 Modals & Drawers

- Desktop form sederhana: modal max-width 560–640px.
- Detail kompleks: side drawer 480–560px.
- Mobile: bottom sheet atau full-screen dialog.
- Header dan footer modal sticky untuk form panjang.
- Destructive modal menampilkan nama data yang akan dihapus.
- Escape dan klik backdrop menutup dialog hanya jika tidak ada proses submit.

### 6.6 Forms & Date Picker

- Label selalu terlihat; placeholder bukan label.
- Input height 44px.
- Helper/error text di bawah field.
- Required marker disertai `aria-required`.
- Date picker menonaktifkan tanggal masa lalu untuk tenggat.
- Tanggal tampil dalam locale Indonesia: `dd MMM yyyy`.
- Data yang dikirim ke API tetap ISO 8601.
- Untuk request peminjaman, tanggal pinjam ditampilkan read-only karena ditetapkan server.

### 6.7 Toast & Alerts

- Success: kanan atas desktop, atas tengah mobile.
- Error validasi form: inline dan summary alert bila banyak field.
- Error server: toast + pesan actionable.
- Durasi success 3–4 detik; error tidak auto-dismiss terlalu cepat.
- Toast tidak menggantikan confirmation state di halaman.

### 6.8 Search, Filter, Sort

Komponen filter menggunakan popover pada desktop dan bottom sheet pada mobile. Tampilkan jumlah filter aktif. Gunakan URL query parameters agar state dapat dipertahankan saat refresh.

Contoh:

```text
/assets?q=proyektor&category=3&location=2&availability=TERSEDIA
```

Walau filtering dilakukan client-side karena endpoint belum memiliki query resmi, URL tetap dapat menyimpan state UI.

## 7. Page Layout

### Admin / Staff

- Sidebar 264px, collapsible menjadi 80px.
- Top bar 72px sticky.
- Content menggunakan max-width 1440px.
- Breadcrumb hanya untuk kedalaman route > 1.
- Primary action ditempatkan kanan atas header.

### User / Mahasiswa-Dosen

- Desktop: navbar horizontal 72px dengan brand, Katalog, Pinjaman Saya, Riwayat, profil.
- Mobile: top app bar + bottom navigation 4 item.
- Katalog memakai card grid, bukan tabel sebagai default.
- Aksi “Ajukan Pinjaman” menjadi CTA yang jelas pada detail aset.

## 8. Micro-interactions & Animation

Gunakan durasi konsisten:

- Hover/focus: 120–180ms.
- Dropdown/popover: 160–220ms.
- Modal/drawer: 220–280ms.
- Page transition: 180–240ms.
- Skeleton shimmer: 1.4–1.8s loop.

Spesifikasi:

- Card hover: `translateY(-2px)` + shadow.
- Button active: `scale(0.98)` selama 80–120ms.
- Modal: backdrop fade + panel scale 0.98 ke 1 dan translateY 8px ke 0.
- Drawer: translateX 16px ke 0.
- New/updated row: highlight indigo soft selama 1.2 detik.
- Success icon: check stroke draw atau scale-in singkat.
- Respect `prefers-reduced-motion`; nonaktifkan transform besar.

## 9. Loading & Data Feedback

- Gunakan skeleton yang menyerupai layout akhir.
- Jangan memakai spinner global untuk seluruh halaman jika struktur dapat ditampilkan sebagai skeleton.
- Table skeleton: 5–8 rows.
- Card grid skeleton: jumlah sesuai breakpoint.
- Optimistic UI hanya untuk aksi reversible dan kontrak stabil; untuk approve/return gunakan server-confirmed update.

## 10. Accessibility

- Kontras teks minimal 4.5:1.
- Focus ring: `ring-2 ring-indigo-500 ring-offset-2`.
- Semua icon-only button memiliki label.
- Dialog mengunci focus dan mengembalikan focus ke trigger.
- Status tidak hanya dibedakan melalui warna.
- Error form dikaitkan dengan input melalui `aria-describedby`.
- Table memiliki header semantik dan caption yang dapat dibaca screen reader.
- Target sentuh minimum 40×40px, ideal 44×44px.

## 11. Iconography & Illustration

Gunakan icon outline konsisten dari `lucide-react`, ukuran 18–20px untuk controls dan 22–24px untuk navigation. Hindari mencampur tiga gaya icon berbeda.

Empty state dapat memakai ilustrasi abstrak ringan berbentuk inventaris, box, clipboard, atau search. Jangan menggunakan ilustrasi besar di halaman operasional.

## 12. Recommended Shared Components

```text
AppShell
RoleGuard
PageHeader
Breadcrumbs
ThemeToggle
UserMenu
SummaryCard
StatusBadge
ConditionBadge
SearchInput
FilterPopover
DataTable
MobileDataCard
EmptyState
ErrorState
SkeletonCard
SkeletonTable
ConfirmDialog
FormDialog
SideDrawer
DatePicker
ToastProvider
Pagination
```

## 13. Global Acceptance Criteria

- Semua warna berasal dari token atau semantic mapping.
- Tidak ada hex acak di komponen fitur.
- Dark mode bukan sekadar inversion; kontras surface tetap jelas.
- Semua halaman dapat digunakan dengan keyboard.
- Layout tidak overflow pada lebar 320px.
- Semua status enum backend memiliki badge yang konsisten.
- Pengguna tidak melihat action di luar role-nya.

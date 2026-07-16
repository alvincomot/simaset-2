export const borrowingStatusMap = {
  PENDING: {
    label: 'Pending',
    badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50',
    dotClass: 'bg-orange-500',
  },
  AKTIF: {
    label: 'Aktif',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50',
    dotClass: 'bg-indigo-500',
  },
  SELESAI: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-500',
  },
};

export const assetAvailabilityMap = {
  TERSEDIA: {
    label: 'Tersedia',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-500',
  },
  DIPINJAM: {
    label: 'Dipinjam',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    dotClass: 'bg-blue-500',
  },
  PEMELIHARAAN: {
    label: 'Pemeliharaan',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    dotClass: 'bg-amber-500',
  },
  DIALOKASIKAN: {
    label: 'Dialokasikan',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    dotClass: 'bg-purple-500',
  },
};

export const enumLabels = {
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

export const jenisKejadianMap = {
  ALOKASI: {
    label: 'Alokasi ke Lokasi',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    icon: 'PackagePlus',
  },
  RELOKASI: {
    label: 'Relokasi Aset',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50',
    icon: 'ArrowRightLeft',
  },
  MASUK_SERVIS: {
    label: 'Masuk Pemeliharaan',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    icon: 'Wrench',
  },
  SELESAI_SERVIS: {
    label: 'Selesai Servis & Kembali',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    icon: 'CheckCircle2',
  },
};

// Feature flags — seluruh fitur alokasi vNext dimatikan (false) sampai uji dan verifikasi di tahap berikutnya
export const features = {
  userManagement: false,
  borrowingRejection: false,
  borrowingCancellation: false,
  manualMaintenance: false,
  reportsExport: false,
  assetAllocation: true,
  assetRelocation: true,
  allocatedCatalog: true,
  allocationMaintenance: true,
  allocationHistory: true,
};

export const assetConditionMap = {
  BAIK: {
    label: 'Baik',
    badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50',
    dotClass: 'bg-teal-500',
  },
  RUSAK: {
    label: 'Rusak',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    dotClass: 'bg-rose-500',
  },
};

export const ADMIN_STAFF_NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    title: 'Inventaris',
    items: [
      { label: 'Manajemen Aset', path: '/assets', icon: 'Package' },
    ],
  },
  {
    title: 'Peminjaman',
    items: [
      { label: 'Antrian Pending', path: '/borrowings?status=PENDING', icon: 'Clock' },
      { label: 'Sedang Dipinjam', path: '/borrowings?status=AKTIF', icon: 'CheckCircle2' },
      { label: 'Riwayat Transaksi', path: '/borrowings/history', icon: 'History' },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Kategori', path: '/masters/categories', icon: 'Tags' },
      { label: 'Lokasi', path: '/masters/locations', icon: 'MapPin' },
    ],
  },
];

export const USER_NAV_ITEMS = [
  { label: 'Katalog Aset', path: '/catalog', icon: 'Package' },
  { label: 'Pinjaman Saya', path: '/my-borrowings', icon: 'Clock' },
  { label: 'Riwayat', path: '/my-borrowings/history', icon: 'History' },
];

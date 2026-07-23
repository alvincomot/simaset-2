export const borrowingStatusMap = {
  PENDING: {
    label: "Pending",
    badgeClass: "badge-orange border",
    dotClass: "dot-orange",
  },
  AKTIF: {
    label: "Aktif",
    badgeClass: "badge-indigo border",
    dotClass: "dot-indigo",
  },
  DITOLAK: {
    label: "Ditolak",
    badgeClass: "badge-rose border",
    dotClass: "dot-rose",
  },
  SELESAI: {
    label: "Selesai",
    badgeClass: "badge-emerald border",
    dotClass: "dot-emerald",
  },
};

export const assetAvailabilityMap = {
  TERSEDIA: {
    label: "Tersedia",
    badgeClass: "badge-emerald border",
    dotClass: "dot-emerald",
  },
  DIPINJAM: {
    label: "Dipinjam",
    badgeClass: "badge-blue border",
    dotClass: "dot-blue",
  },
  PEMELIHARAAN: {
    label: "Pemeliharaan",
    badgeClass: "badge-amber border",
    dotClass: "dot-amber",
  },
  DIALOKASIKAN: {
    label: "Dialokasikan",
    badgeClass: "badge-purple border",
    dotClass: "dot-purple",
  },
};

export const enumLabels = {
  BAIK: "Baik",
  RUSAK: "Rusak",
  TERSEDIA: "Tersedia",
  DIPINJAM: "Dipinjam",
  PEMELIHARAAN: "Pemeliharaan",
  DIALOKASIKAN: "Dialokasikan", // gunakan hanya setelah backend vNext aktif
  PENDING: "Pending",
  AKTIF: "Aktif",
  DITOLAK: "Ditolak",
  SELESAI: "Selesai",
};

export const jenisKejadianMap = {
  ALOKASI: {
    label: "Alokasi ke Lokasi",
    badgeClass: "badge-purple border",
    icon: "PackagePlus",
  },
  RELOKASI: {
    label: "Relokasi Aset",
    badgeClass: "badge-indigo border",
    icon: "ArrowRightLeft",
  },
  MASUK_SERVIS: {
    label: "Masuk Pemeliharaan",
    badgeClass: "badge-amber border",
    icon: "Wrench",
  },
  SELESAI_SERVIS: {
    label: "Selesai Servis & Kembali",
    badgeClass: "badge-emerald border",
    icon: "CheckCircle2",
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
    label: "Baik",
    badgeClass: "badge-teal border",
    dotClass: "dot-teal",
  },
  RUSAK: {
    label: "Rusak",
    badgeClass: "badge-rose border",
    dotClass: "dot-rose",
  },
};

export const ADMIN_STAFF_NAV_GROUPS = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    title: "Inventaris",
    items: [{ label: "Manajemen Aset", path: "/assets", icon: "Package" }],
  },
  {
    title: "Peminjaman",
    items: [
      { label: "Antrian Pending", path: "/borrowings?status=PENDING", icon: "Clock" },
      { label: "Sedang Dipinjam", path: "/borrowings?status=AKTIF", icon: "CheckCircle2" },
      { label: "Riwayat Transaksi", path: "/borrowings/history", icon: "History" },
    ],
  },
  {
    title: "Master Data",
    items: [
      { label: "Kategori", path: "/masters/categories", icon: "Tags" },
      { label: "Lokasi", path: "/masters/locations", icon: "MapPin" },
    ],
  },
];

export const USER_NAV_ITEMS = [
  { label: "Katalog Aset", path: "/catalog", icon: "Package" },
  { label: "Pinjaman Saya", path: "/my-borrowings", icon: "Clock" },
  { label: "Riwayat", path: "/my-borrowings/history", icon: "History" },
];

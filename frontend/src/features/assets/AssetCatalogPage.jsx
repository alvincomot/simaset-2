import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, MapPin, Tag, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import client from '../../lib/api/client';
import { features } from '../../lib/constants';
import { getUserAllocatedCatalog } from '../../lib/api/allocationApi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConditionBadge from '../../components/ui/ConditionBadge';
import SkeletonCard from '../../components/feedback/SkeletonCard';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import BorrowingRequestDialog from '../borrowing/BorrowingRequestDialog';

export const AssetCatalogPage = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allocatedCatalogData, setAllocatedCatalogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');

  // Borrowing request modal state
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState(null);

  const fetchData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [assetsRes, catRes, locRes, allocRes] = await Promise.all([
        client.get('/assets'),
        client.get('/masters/categories'),
        client.get('/masters/locations'),
        features.allocatedCatalog
          ? getUserAllocatedCatalog().catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      setAssets(assetsRes.data || assetsRes || []);
      setCategories(catRes.data || catRes || []);
      setLocations(locRes.data || locRes || []);
      setAllocatedCatalogData(allocRes.data || allocRes || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat katalog aset dan master filter.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic for standard individual assets
  const filteredAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter((asset) => {
      // Rule 7: Aset DIALOKASIKAN tidak boleh muncul pada katalog utama peminjaman secara default
      if (selectedAvailability === 'ALL' && asset.statusKetersediaan === 'DIALOKASIKAN') {
        return false;
      }

      const matchSearch =
        !searchQuery ||
        asset.namaAset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.kodeAset?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || String(asset.categoryId) === String(selectedCategory);

      const matchLocation =
        selectedLocation === 'ALL' || String(asset.locationId) === String(selectedLocation);

      const matchAvailability =
        selectedAvailability === 'ALL' || asset.statusKetersediaan === selectedAvailability;

      return matchSearch && matchCategory && matchLocation && matchAvailability;
    });
  }, [assets, searchQuery, selectedCategory, selectedLocation, selectedAvailability]);

  // Filter logic for safe allocated summary view (Rule 8)
  const filteredAllocatedCatalog = useMemo(() => {
    if (!Array.isArray(allocatedCatalogData)) return [];
    return allocatedCatalogData.filter((group) => {
      if (!searchQuery) return true;
      return (
        group.namaLokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [allocatedCatalogData, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedLocation('ALL');
    setSelectedAvailability('ALL');
  };

  if (error) {
    return <ErrorState title="Gagal Memuat Katalog" message={error} onRetry={fetchData} />;
  }

  const isShowingAllocatedCatalog =
    features.allocatedCatalog && selectedAvailability === 'DIALOKASIKAN';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase border border-white/20">
            {isShowingAllocatedCatalog ? 'Katalog Fasilitas Teralokasi' : 'Katalog Aset Operasional'}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">
            {isShowingAllocatedCatalog ? 'Fasilitas Ruangan & Laboratorium' : 'Cari & Ajukan Peminjaman Aset'}
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 mt-2 leading-relaxed opacity-90">
            {isShowingAllocatedCatalog
              ? 'Informasi fasilitas semi-permanen yang ditempatkan pada ruangan kampus untuk mendukung kegiatan perkuliahan dan praktikum (Aman & Bebas Data Sensitif).'
              : 'Jelajahi seluruh inventaris kampus yang tersedia. Pilih barang operasional, tentukan tenggat waktu, dan langsung ajukan pinjaman Anda.'}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none hidden md:block">
          <Package className="w-64 h-64" />
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isShowingAllocatedCatalog
                  ? 'Cari nama ruangan atau deskripsi laboratorium...'
                  : 'Cari nama aset atau kode barang (misal: Proyektor, LAB-01)...'
              }
              className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={RefreshCw}
              onClick={fetchData}
              title="Refresh Katalog"
            >
              Refresh
            </Button>
            {(searchQuery || selectedCategory !== 'ALL' || selectedLocation !== 'ALL' || selectedAvailability !== 'ALL') && (
              <Button variant="ghost" size="md" onClick={resetFilters}>
                Reset Filter
              </Button>
            )}
          </div>
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {!isShowingAllocatedCatalog && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Filter Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.namaKategori}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Filter Lokasi
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="block w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Lokasi</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.namaLokasi}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className={isShowingAllocatedCatalog ? 'sm:col-span-3' : ''}>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Tipe Katalog & Ketersediaan
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="block w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Katalog Peminjaman (Default Tanpa Alokasi)</option>
              <option value="TERSEDIA">Hanya Tersedia (Bisa Dipinjam)</option>
              <option value="DIPINJAM">Sedang Dipinjam</option>
              {features.allocatedCatalog && (
                <option value="DIALOKASIKAN">Fasilitas Ruangan (Aset Teralokasi)</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 px-1">
        <span>
          Menampilkan{' '}
          <strong className="text-slate-900 dark:text-slate-100">
            {isShowingAllocatedCatalog ? filteredAllocatedCatalog.length : filteredAssets.length}
          </strong>{' '}
          {isShowingAllocatedCatalog ? 'ruangan / fasilitas' : 'aset'}
        </span>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <SkeletonCard count={8} />
        </div>
      ) : isShowingAllocatedCatalog ? (
        /* Rule 8: Safe Grouped View for Allocated Facilities */
        filteredAllocatedCatalog.length === 0 ? (
          <EmptyState
            iconName="Layers"
            title="Tidak Ada Fasilitas Teralokasi"
            message="Belum ada data fasilitas semi-permanen yang dialokasikan ke ruangan yang cocok dengan filter pencarian Anda."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAllocatedCatalog.map((group) => {
              const cats = group.categories || group.itemSummary || [];
              const totalUnits = group.totalAllocated || cats.reduce((acc, c) => acc + (c.jumlahUnit || c.count || 0), 0);

              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        {totalUnits} Unit Aset
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {group.namaLokasi || 'Ruangan Fasilitas'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {group.deskripsi || 'Fasilitas ruangan perkuliahan / laboratorium kampus.'}
                      </p>
                    </div>
                  </div>

                  {/* Safe breakdown by category only (no asset codes, no staff identity) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Ringkasan Kategori Aset
                    </p>
                    {cats.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                        {cats.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <span>{c.namaKategori || c.categoryName || 'Fasilitas'}</span>
                            <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {c.jumlahUnit || c.count || 1} Unit
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Fasilitas umum teralokasi</p>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Fasilitas ruangan tetap · Tidak tersedia untuk peminjaman mandiri</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Standard Individual Asset Cards */
        filteredAssets.length === 0 ? (
          <EmptyState
            iconName="Search"
            title="Aset Tidak Ditemukan"
            message="Tidak ada aset yang cocok dengan kriteria pencarian dan filter Anda saat ini."
            actionLabel="Reset Filter Pencarian"
            onAction={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAssets.map((asset) => {
              const isAvailable = asset.statusKetersediaan === 'TERSEDIA';

              return (
                <div
                  key={asset.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Top */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700">
                        {asset.kodeAset}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={asset.statusKetersediaan} />
                        <ConditionBadge condition={asset.kondisi} />
                      </div>
                    </div>

                    <div>
                      <h3
                        onClick={() => navigate(`/catalog/${asset.id}`)}
                        className="text-base font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {asset.namaAset}
                      </h3>
                    </div>

                    {/* Meta badges */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                        <Tag className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          Kategori: <strong className="text-slate-800 dark:text-slate-200">{asset.category?.namaKategori || 'Umum'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          Lokasi: <strong className="text-slate-800 dark:text-slate-200">{asset.location?.namaLokasi || 'Gudang'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/catalog/${asset.id}`)}
                      className="text-xs text-slate-600 dark:text-slate-300"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!isAvailable}
                      onClick={() => setSelectedBorrowAsset(asset)}
                      className="text-xs px-3"
                      title={isAvailable ? 'Ajukan Peminjaman Aset Ini' : 'Aset sedang tidak tersedia'}
                    >
                      Ajukan Pinjam
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Borrowing Request Modal */}
      {selectedBorrowAsset && (
        <BorrowingRequestDialog
          isOpen={!!selectedBorrowAsset}
          onClose={() => setSelectedBorrowAsset(null)}
          asset={selectedBorrowAsset}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default AssetCatalogPage;

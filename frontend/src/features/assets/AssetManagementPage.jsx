import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, RefreshCw, PackagePlus, ArrowRightLeft, Wrench, CheckCircle2 } from 'lucide-react';
import client from '../../lib/api/client';
import { features } from '../../lib/constants';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConditionBadge from '../../components/ui/ConditionBadge';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/feedback/ToastProvider';
import CreateAssetDialog from './CreateAssetDialog';
import EditAssetDialog from './EditAssetDialog';
import AllocateAssetDialog from './AllocateAssetDialog';
import RelocateAssetDialog from './RelocateAssetDialog';
import StartMaintenanceDialog from './StartMaintenanceDialog';
import FinishMaintenanceDialog from './FinishMaintenanceDialog';

export const AssetManagementPage = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
  const conditionParam = searchParams.get('condition');

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState(conditionParam || 'ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Allocation & Maintenance state (gated by features)
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isRelocateOpen, setIsRelocateOpen] = useState(false);
  const [targetAssetsForModal, setTargetAssetsForModal] = useState([]);
  const [maintenanceStartAsset, setMaintenanceStartAsset] = useState(null);
  const [maintenanceFinishAsset, setMaintenanceFinishAsset] = useState(null);

  // Open create dialog if URL has action=create
  useEffect(() => {
    if (actionParam === 'create') {
      setIsCreateOpen(true);
      setSearchParams({});
    }
  }, [actionParam, setSearchParams]);

  // Sync condition param
  useEffect(() => {
    if (conditionParam) {
      setSelectedCondition(conditionParam);
    }
  }, [conditionParam]);

  const fetchData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [assetsRes, catRes, locRes] = await Promise.all([
        client.get('/assets'),
        client.get('/masters/categories'),
        client.get('/masters/locations'),
      ]);

      setAssets(assetsRes.data || assetsRes || []);
      setCategories(catRes.data || catRes || []);
      setLocations(locRes.data || locRes || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data inventaris dan master.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered list
  const filteredAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter((asset) => {
      const matchSearch =
        !searchQuery ||
        asset.namaAset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.kodeAset?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || String(asset.categoryId) === String(selectedCategory);

      const matchLocation =
        selectedLocation === 'ALL' || String(asset.locationId) === String(selectedLocation);

      const matchCondition =
        selectedCondition === 'ALL' || asset.kondisi === selectedCondition;

      return matchSearch && matchCategory && matchLocation && matchCondition;
    });
  }, [assets, searchQuery, selectedCategory, selectedLocation, selectedCondition]);

  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await client.delete(`/assets/${deletingAsset.id}`);
      toast.success('Aset Dihapus', `"${deletingAsset.namaAset}" berhasil dihapus dari inventaris.`);
      setDeletingAsset(null);
      setSelectedAssetIds([]);
      fetchData();
    } catch (err) {
      // If 400 Foreign Key constraint (e.g. borrowing history exists)
      const msg = err.message || 'Aset tidak dapat dihapus karena memiliki riwayat transaksi.';
      setDeleteError(msg);
      toast.error('Gagal Menghapus Aset', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const eligibleIds = filteredAssets
        .filter(
          (a) =>
            a.statusKetersediaan !== 'DIPINJAM' &&
            a.statusKetersediaan !== 'PEMELIHARAAN'
        )
        .map((a) => a.id);
      setSelectedAssetIds(eligibleIds);
    } else {
      setSelectedAssetIds([]);
    }
  };

  const handleToggleSelect = (assetId) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleOpenAllocate = (assetsList) => {
    setTargetAssetsForModal(assetsList);
    setIsAllocateOpen(true);
  };

  const handleOpenRelocate = (assetsList) => {
    setTargetAssetsForModal(assetsList);
    setIsRelocateOpen(true);
  };

  if (error) {
    return <ErrorState title="Gagal Memuat Manajemen Aset" message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Manajemen Inventaris Aset
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola data barang operasional, penempatan lokasi, status ketersediaan, dan kondisi fisik.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            title="Muat ulang tabel"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Tambah Aset Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama aset atau kode barang..."
              className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.namaKategori}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.namaLokasi}
                </option>
              ))}
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="BAIK">Baik</option>
              <option value="RUSAK">Rusak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative">
        {isLoading ? (
          <SkeletonTable rows={8} columns={6} />
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            iconName="Package"
            title="Tidak ada aset ditemukan"
            message="Belum ada aset inventaris atau tidak ada item yang sesuai filter Anda."
            actionLabel="Tambah Aset Baru"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {(features.assetAllocation || features.assetRelocation) && filteredAssets.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/60 sticky top-0 z-10 backdrop-blur-md">
                  <input
                    type="checkbox"
                    checked={
                      filteredAssets.filter(
                        (a) =>
                          a.statusKetersediaan !== 'DIPINJAM' && a.statusKetersediaan !== 'PEMELIHARAAN'
                      ).length > 0 &&
                      selectedAssetIds.length ===
                        filteredAssets.filter(
                          (a) =>
                            a.statusKetersediaan !== 'DIPINJAM' && a.statusKetersediaan !== 'PEMELIHARAAN'
                        ).length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Pilih Semua ({filteredAssets.filter((a) => a.statusKetersediaan !== 'DIPINJAM' && a.statusKetersediaan !== 'PEMELIHARAAN').length} Aset)
                  </span>
                </div>
              )}
              {filteredAssets.map((asset) => {
                const isEligibleSelect =
                  asset.statusKetersediaan !== 'DIPINJAM' &&
                  asset.statusKetersediaan !== 'PEMELIHARAAN';

                return (
                  <div key={asset.id} className={`flex flex-col gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                    selectedAssetIds.includes(asset.id) ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                  }`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {(features.assetAllocation || features.assetRelocation) && (
                          <input
                            type="checkbox"
                            checked={selectedAssetIds.includes(asset.id)}
                            onChange={() => handleToggleSelect(asset.id)}
                            disabled={!isEligibleSelect}
                            className="mt-1 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{asset.namaAset}</h4>
                          <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">{asset.kodeAset}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={asset.statusKetersediaan} />
                        <ConditionBadge condition={asset.kondisi} />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">Kategori</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{asset.category?.namaKategori || 'Umum'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">Lokasi</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{asset.location?.namaLokasi || 'Gudang'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {features.assetAllocation && asset.statusKetersediaan === 'TERSEDIA' && (
                        <button type="button" onClick={() => handleOpenAllocate([asset])} className="p-2 rounded-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 transition-colors" title="Alokasikan Aset">
                          <PackagePlus className="w-4 h-4" />
                        </button>
                      )}
                      {features.assetRelocation && asset.statusKetersediaan === 'DIALOKASIKAN' && (
                        <button type="button" onClick={() => handleOpenRelocate([asset])} className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors" title="Relokasi Aset">
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      )}
                      {features.allocationMaintenance && (asset.statusKetersediaan === 'DIALOKASIKAN' || asset.statusKetersediaan === 'TERSEDIA') && (
                        <button type="button" onClick={() => setMaintenanceStartAsset(asset)} className="p-2 rounded-lg text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 transition-colors" title="Pindahkan ke Pemeliharaan">
                          <Wrench className="w-4 h-4" />
                        </button>
                      )}
                      {features.allocationMaintenance && asset.statusKetersediaan === 'PEMELIHARAAN' && (
                        <button type="button" onClick={() => setMaintenanceFinishAsset(asset)} className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors" title="Selesaikan Servis & Kembalikan">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => setEditingAsset(asset)} className="p-2 rounded-lg text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Edit aset">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => { setDeleteError(''); setDeletingAsset(asset); }} className="p-2 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 transition-colors" title="Hapus aset">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {(features.assetAllocation || features.assetRelocation) && (
                    <th className="py-3.5 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua aset eligible"
                        onChange={handleSelectAll}
                        checked={
                          filteredAssets.length > 0 &&
                          filteredAssets
                            .filter(
                              (a) =>
                                a.statusKetersediaan !== 'DIPINJAM' &&
                                a.statusKetersediaan !== 'PEMELIHARAAN'
                            )
                            .every((a) => selectedAssetIds.includes(a.id)) &&
                          selectedAssetIds.length > 0
                        }
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3.5 px-6">Informasi Aset</th>
                  <th className="py-3.5 px-6">Kategori</th>
                  <th className="py-3.5 px-6">Lokasi</th>
                  <th className="py-3.5 px-6">Ketersediaan</th>
                  <th className="py-3.5 px-6">Kondisi</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredAssets.map((asset) => {
                  const isEligibleSelect =
                    asset.statusKetersediaan !== 'DIPINJAM' &&
                    asset.statusKetersediaan !== 'PEMELIHARAAN';

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedAssetIds.includes(asset.id)
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/30'
                          : ''
                      }`}
                    >
                      {(features.assetAllocation || features.assetRelocation) && (
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedAssetIds.includes(asset.id)}
                            onChange={() => handleToggleSelect(asset.id)}
                            disabled={!isEligibleSelect}
                            title={
                              !isEligibleSelect
                                ? 'Aset sedang dipinjam atau dalam pemeliharaan'
                                : undefined
                            }
                            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                        </td>
                      )}
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{asset.namaAset}</p>
                          <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {asset.kodeAset}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        {asset.category?.namaKategori || 'Umum'}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {asset.location?.namaLokasi || 'Gudang'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={asset.statusKetersediaan} />
                      </td>
                      <td className="py-4 px-6">
                        <ConditionBadge condition={asset.kondisi} />
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        {/* Alokasi Action */}
                        {features.assetAllocation && asset.statusKetersediaan === 'TERSEDIA' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAllocate([asset])}
                            className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
                            title="Alokasikan Aset"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Relokasi Action */}
                        {features.assetRelocation && asset.statusKetersediaan === 'DIALOKASIKAN' && (
                          <button
                            type="button"
                            onClick={() => handleOpenRelocate([asset])}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                            title="Relokasi Aset"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        )}

                        {/* Masuk Servis Action */}
                        {features.allocationMaintenance &&
                          (asset.statusKetersediaan === 'DIALOKASIKAN' ||
                            asset.statusKetersediaan === 'TERSEDIA') && (
                            <button
                              type="button"
                              onClick={() => setMaintenanceStartAsset(asset)}
                              className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors"
                              title="Pindahkan ke Pemeliharaan"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          )}

                        {/* Selesaikan Servis Action */}
                        {features.allocationMaintenance &&
                          asset.statusKetersediaan === 'PEMELIHARAAN' && (
                            <button
                              type="button"
                              onClick={() => setMaintenanceFinishAsset(asset)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                              title="Selesaikan Servis & Kembalikan"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => setEditingAsset(asset)}
                          className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                          title="Edit aset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeletingAsset(asset);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                          title="Hapus aset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}

        {/* Sticky Bulk Action Bar */}
        {selectedAssetIds.length > 0 && (
          <div className="sticky bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-in slide-in-from-bottom duration-200 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex flex-row items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-bold text-sm leading-none flex items-center justify-center min-w-[2rem]">
                  {selectedAssetIds.length}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Aset Terpilih
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setSelectedAssetIds([])}
                className="px-3"
              >
                Batal
              </Button>
            </div>
            
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {features.assetAllocation && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={PackagePlus}
                  className="flex-1 sm:flex-none justify-center"
                  onClick={() => {
                    const targets = filteredAssets.filter((a) => selectedAssetIds.includes(a.id));
                    handleOpenAllocate(targets);
                  }}
                >
                  <span className="hidden sm:inline">Alokasikan Aset Terpilih</span>
                  <span className="sm:hidden">Alokasi</span>
                </Button>
              )}
              {features.assetRelocation && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ArrowRightLeft}
                  className="flex-1 sm:flex-none justify-center"
                  onClick={() => {
                    const targets = filteredAssets.filter((a) => selectedAssetIds.includes(a.id));
                    handleOpenRelocate(targets);
                  }}
                >
                  <span className="hidden sm:inline">Relokasi Aset Terpilih</span>
                  <span className="sm:hidden">Relokasi</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateAssetDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories}
        locations={locations}
        onSuccess={fetchData}
      />

      <EditAssetDialog
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        categories={categories}
        locations={locations}
        onSuccess={fetchData}
      />

      <AllocateAssetDialog
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        assets={targetAssetsForModal}
        locations={locations}
        onSuccess={() => {
          setSelectedAssetIds([]);
          fetchData();
        }}
      />

      <RelocateAssetDialog
        isOpen={isRelocateOpen}
        onClose={() => setIsRelocateOpen(false)}
        assets={targetAssetsForModal}
        locations={locations}
        onSuccess={() => {
          setSelectedAssetIds([]);
          fetchData();
        }}
      />

      <StartMaintenanceDialog
        isOpen={!!maintenanceStartAsset}
        onClose={() => setMaintenanceStartAsset(null)}
        asset={maintenanceStartAsset}
        locations={locations}
        onSuccess={fetchData}
      />

      <FinishMaintenanceDialog
        isOpen={!!maintenanceFinishAsset}
        onClose={() => setMaintenanceFinishAsset(null)}
        asset={maintenanceFinishAsset}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Aset Inventaris"
        message={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus aset permanen dari inventaris?`
        }
        targetName={deletingAsset?.namaAset ? `${deletingAsset.namaAset} (${deletingAsset.kodeAset})` : ''}
        confirmLabel="Ya, Hapus Aset"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AssetManagementPage;

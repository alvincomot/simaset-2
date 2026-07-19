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
          <div className="overflow-x-auto">
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
        )}

        {/* Sticky Bulk Action Bar */}
        {selectedAssetIds.length > 0 && (
          <div className="sticky bottom-0 inset-x-0 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 backdrop-blur-md text-white px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200 z-20">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-sm">
                {selectedAssetIds.length} Terpilih
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Pilih aksi alokasi atau relokasi untuk aset dalam batch.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAssetIds([])}
                className=""
              >
                Batal Pilih
              </Button>
              {features.assetAllocation && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={PackagePlus}
                  onClick={() => {
                    const targets = filteredAssets.filter((a) => selectedAssetIds.includes(a.id));
                    handleOpenAllocate(targets);
                  }}
                >
                  Alokasikan Aset Terpilih
                </Button>
              )}
              {features.assetRelocation && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ArrowRightLeft}
                  onClick={() => {
                    const targets = filteredAssets.filter((a) => selectedAssetIds.includes(a.id));
                    handleOpenRelocate(targets);
                  }}
                >
                  Relokasi Aset Terpilih
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

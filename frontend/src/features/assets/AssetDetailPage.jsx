import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Clock,
  PackagePlus,
  ArrowRightLeft,
  Wrench,
  CheckCircle2,
  History,
} from 'lucide-react';
import client from '../../lib/api/client';
import { useAuth } from '../../lib/auth/authContext';
import { features, jenisKejadianMap } from '../../lib/constants';
import { getAllocationHistory } from '../../lib/api/allocationApi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConditionBadge from '../../components/ui/ConditionBadge';
import SkeletonCard from '../../components/feedback/SkeletonCard';
import ErrorState from '../../components/feedback/ErrorState';
import BorrowingRequestDialog from '../borrowing/BorrowingRequestDialog';
import AllocateAssetDialog from './AllocateAssetDialog';
import RelocateAssetDialog from './RelocateAssetDialog';
import StartMaintenanceDialog from './StartMaintenanceDialog';
import FinishMaintenanceDialog from './FinishMaintenanceDialog';

export const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [asset, setAsset] = useState(null);
  const [locations, setLocations] = useState([]);
  const [assetHistory, setAssetHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isRelocateOpen, setIsRelocateOpen] = useState(false);
  const [isStartMaintOpen, setIsStartMaintOpen] = useState(false);
  const [isFinishMaintOpen, setIsFinishMaintOpen] = useState(false);

  const isAdminOrStaff = role === 'SUPER_ADMIN' || role === 'STAFF';

  const fetchAssetDetail = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get(`/assets/${id}`);
      const data = res.data || res;
      if (!data) throw new Error('Aset tidak ditemukan.');
      setAsset(data);

      if (isAdminOrStaff) {
        // Fetch locations for dialogs & timeline history
        const [locRes, histRes] = await Promise.all([
          client.get('/masters/locations'),
          features.allocationHistory
            ? getAllocationHistory({ assetId: id }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);
        setLocations(locRes.data || locRes || []);
        setAssetHistory(histRes.data || histRes || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil spesifikasi detail aset.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <SkeletonCard count={1} className="min-h-[400px]" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <ErrorState
        title="Aset Tidak Ditemukan"
        message={error || 'Aset dengan ID tersebut tidak tersedia di sistem.'}
        onRetry={fetchAssetDetail}
      />
    );
  }

  const isAvailable = asset.statusKetersediaan === 'TERSEDIA';
  const isBorrowable = asset.statusKetersediaan === 'TERSEDIA' && asset.kondisi === 'BAIK';
  const isAllocated = asset.statusKetersediaan === 'DIALOKASIKAN';
  const isMaintenance = asset.statusKetersediaan === 'PEMELIHARAAN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
          className="text-slate-600 dark:text-slate-400"
        >
          Kembali
        </Button>
      </div>

      {/* Main Detail Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-indigo-200 font-bold border border-white/20">
                {asset.kodeAset}
              </span>
              <StatusBadge status={asset.statusKetersediaan} />
              <ConditionBadge condition={asset.kondisi} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {asset.namaAset}
            </h1>
            <p className="text-sm text-slate-300">
              Aset inventaris resmi kampus. Gunakan dengan bertanggung jawab dan sesuai SOP operasional.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end gap-3">
            {/* Rule 9: Aset DIALOKASIKAN tidak boleh memiliki tombol atau aksi peminjaman */}
            {!isAllocated && (
              <Button
                variant="primary"
                size="lg"
                disabled={!isBorrowable}
                onClick={() => setIsBorrowModalOpen(true)}
                className="w-full sm:w-auto shadow-xl"
                title={
                  isBorrowable
                    ? 'Ajukan Pinjaman'
                    : asset.kondisi === 'RUSAK'
                    ? 'Aset rusak dan tidak dapat dipinjam'
                    : 'Aset sedang tidak tersedia'
                }
              >
                Ajukan Pinjaman
              </Button>
            )}

            {/* Admin / Staff Mutation Actions (Gated by feature flags) */}
            {isAdminOrStaff && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {features.assetAllocation && isAvailable && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={PackagePlus}
                    onClick={() => setIsAllocateOpen(true)}
                  >
                    Alokasikan Aset
                  </Button>
                )}
                {features.assetRelocation && isAllocated && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ArrowRightLeft}
                    onClick={() => setIsRelocateOpen(true)}
                  >
                    Pindahkan Alokasi
                  </Button>
                )}
                {features.allocationMaintenance && (isAllocated || isAvailable) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Wrench}
                    onClick={() => setIsStartMaintOpen(true)}
                  >
                    Pindahkan ke Pemeliharaan
                  </Button>
                )}
                {features.allocationMaintenance && isMaintenance && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => setIsFinishMaintOpen(true)}
                  >
                    Selesaikan Servis & Kembalikan
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spec Grid */}
        <div className="p-6 sm:p-8 divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kategori Aset
                </p>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {asset.category?.namaKategori || 'Kategori Umum'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ID Kategori: #{asset.categoryId || asset.kategoriId}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lokasi & Penempatan
                </p>
                {/* Rule 10: Pisahkan tampilan lokasi aktual & lokasi alokasi */}
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {asset.location?.namaLokasi || 'Gudang Pusat'}
                </h4>
                {asset.lokasiAlokasiId ? (
                  <div className="mt-1 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-xs">
                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                      Lokasi Alokasi Asal: {asset.lokasiAlokasi?.namaLokasi || `#${asset.lokasiAlokasiId}`}
                    </p>
                    {isMaintenance && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        ⚠️ Sedang berada di Ruang Servis, akan kembali ke ruangan ini setelah servis selesai.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ID Lokasi Aktual: #{asset.locationId || asset.lokasiId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kondisi Fisik
                </p>
                <div className="mt-1">
                  <ConditionBadge condition={asset.kondisi} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {asset.kondisi === 'BAIK'
                    ? 'Aset lulus inspeksi berkala dan siap digunakan untuk kegiatan.'
                    : 'Aset memerlukan pemeliharaan atau penggantian suku cadang.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status Ketersediaan
                </p>
                <div className="mt-1">
                  <StatusBadge status={asset.statusKetersediaan} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {isAvailable
                    ? 'Anda dapat mengajukan peminjaman aset ini sekarang.'
                    : isAllocated
                    ? 'Aset dialokasikan secara semi-permanen dan tidak tersedia untuk peminjaman umum.'
                    : 'Aset saat ini sedang dipinjam atau dalam proses maintenance.'}
                </p>
              </div>
            </div>
          </div>

          {/* Allocation & Maintenance History Timeline (Admin/Staff only, gated by allocationHistory) */}
          {isAdminOrStaff && features.allocationHistory && assetHistory.length > 0 && (
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Riwayat Alokasi & Servis Aset Ini</span>
              </div>
              <div className="border-l-2 border-indigo-200 dark:border-indigo-800 ml-3 pl-4 space-y-4">
                {assetHistory.map((h) => {
                  const infoKejadian = jenisKejadianMap[h.jenisKejadian] || {
                    label: h.jenisKejadian,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };
                  const tgl = new Date(h.createdAt || h.waktu || 0);

                  return (
                    <div key={h.id} className="relative text-xs space-y-1">
                      <div className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded font-bold ${infoKejadian.badgeClass}`}>
                          {infoKejadian.label}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {tgl.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {h.lokasiAsal && h.lokasiTujuan
                          ? `${h.lokasiAsal.namaLokasi} → ${h.lokasiTujuan.namaLokasi}`
                          : h.lokasiTujuan?.namaLokasi || h.lokasiAsal?.namaLokasi || '-'}
                      </p>
                      {h.catatan && (
                        <p className="text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                          &ldquo;{h.catatan}&rdquo; —{' '}
                          <span className="font-semibold">{h.user?.namaLengkap || 'Staff'}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guidelines info */}
          <div className="pt-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Package className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Prosedur Peminjaman Aset SIMASET:
                </p>
                <ul className="list-disc list-inside space-y-1 pt-1">
                  <li>Pengajuan pinjaman memerlukan verifikasi dan persetujuan (status <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">PENDING</span>).</li>
                  <li>Ambil barang di lokasi <span className="font-semibold">{asset.location?.namaLokasi || 'terdaftar'}</span> setelah status berubah menjadi <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">AKTIF</span>.</li>
                  <li>Kembalikan barang tepat waktu atau sebelum tenggat waktu pengembalian yang disepakati.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      {isBorrowModalOpen && (
        <BorrowingRequestDialog
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          asset={asset}
          onSuccess={fetchAssetDetail}
        />
      )}

      {/* Allocation Modals */}
      <AllocateAssetDialog
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        assets={[asset]}
        locations={locations}
        onSuccess={fetchAssetDetail}
      />

      <RelocateAssetDialog
        isOpen={isRelocateOpen}
        onClose={() => setIsRelocateOpen(false)}
        assets={[asset]}
        locations={locations}
        onSuccess={fetchAssetDetail}
      />

      <StartMaintenanceDialog
        isOpen={isStartMaintOpen}
        onClose={() => setIsStartMaintOpen(false)}
        asset={asset}
        locations={locations}
        onSuccess={fetchAssetDetail}
      />

      <FinishMaintenanceDialog
        isOpen={isFinishMaintOpen}
        onClose={() => setIsFinishMaintOpen(false)}
        asset={asset}
        onSuccess={fetchAssetDetail}
      />
    </div>
  );
};

export default AssetDetailPage;

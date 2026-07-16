import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Tag, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConditionBadge from '../../components/ui/ConditionBadge';
import SkeletonCard from '../../components/feedback/SkeletonCard';
import ErrorState from '../../components/feedback/ErrorState';
import BorrowingRequestDialog from '../borrowing/BorrowingRequestDialog';

export const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const fetchAssetDetail = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get(`/assets/${id}`);
      const data = res.data || res;
      if (!data) throw new Error('Aset tidak ditemukan.');
      setAsset(data);
    } catch (err) {
      setError(err.message || 'Gagal mengambil spesifikasi detail aset.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
            <Button
              variant="primary"
              size="lg"
              disabled={!isAvailable}
              onClick={() => setIsBorrowModalOpen(true)}
              className="w-full sm:w-auto shadow-xl"
            >
              Ajukan Pinjaman
            </Button>
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
                  ID Kategori: #{asset.kategoriId}
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
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {asset.location?.namaLokasi || 'Gudang Pusat'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ID Lokasi: #{asset.lokasiId}
                </p>
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
                    : 'Aset saat ini sedang dipinjam atau dalam proses maintenance.'}
                </p>
              </div>
            </div>
          </div>

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
    </div>
  );
};

export default AssetDetailPage;

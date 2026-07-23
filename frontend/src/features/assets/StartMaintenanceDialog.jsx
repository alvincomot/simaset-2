import React, { useState } from 'react';
import { Wrench, AlertTriangle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { startMaintenance } from '../../lib/api/allocationApi';
import { useToast } from '../../components/feedback/ToastProvider';

export const StartMaintenanceDialog = ({
  isOpen,
  onClose,
  asset,
  locations = [],
  onSuccess,
}) => {
  const toast = useToast();
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !asset) return null;

  const defaultServisLoc = locations.find(
    (l) =>
      l.namaLokasi?.toLowerCase().includes('servis') ||
      l.namaLokasi?.toLowerCase().includes('perbaikan')
  );
  const targetServisName = defaultServisLoc?.namaLokasi || 'Ruang Servis / Perbaikan';
  const asalName = asset.lokasiAlokasi?.namaLokasi || asset.location?.namaLokasi || 'Lokasi Asal';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catatan.trim()) {
      setErrorMsg('Catatan kerusakan atau keluhan wajib diisi untuk rekam servis.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const servisIdToUse = defaultServisLoc?.id ? Number(defaultServisLoc.id) : undefined;
      const res = await startMaintenance({
        assetId: asset.id,
        lokasiServisId: servisIdToUse,
        catatan: catatan.trim(),
      });

      toast.success(
        'Masuk Pemeliharaan Berhasil',
        `"${asset.namaAset}" dipindahkan ke ${targetServisName} (status PEMELIHARAAN). Lokasi alokasi asal tetap dipertahankan.`
      );

      setCatatan('');
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses aset masuk ke pemeliharaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pindahkan ke Pemeliharaan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {asset.lokasiAlokasiId
                  ? 'Aset masuk servis tanpa kehilangan lokasi alokasi asal'
                  : 'Aset masuk servis ke ruang pemeliharaan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Masuk Servis Gagal</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Asset Info Read-Only */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{asset.namaAset}</p>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
                {asset.kodeAset}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {asset.lokasiAlokasiId ? 'Lokasi Alokasi Asal' : 'Lokasi Penempatan Asal'}: <strong className="text-slate-700 dark:text-slate-300">{asalName}</strong>
            </p>
          </div>

          {/* Servis Location Automatic Display */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tujuan Ruangan Pemeliharaan (Otomatis)
            </label>
            <div className="h-12 px-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 flex items-center justify-between font-medium text-sm">
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{targetServisName}</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                Ruang Servis Default
              </span>
            </div>
          </div>

          {/* Required Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Catatan Kerusakan / Keluhan <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={isSubmitting}
              required
              rows={3}
              placeholder="Jelaskan detail kerusakan fisik atau kendala operasional yang menyebabkan aset harus diservis..."
              className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Domain Explanation */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs space-y-1">
            <p className="font-bold">Konteks Domain Pemeliharaan:</p>
            <p>
              Aset akan berubah status menjadi <strong className="font-mono">PEMELIHARAAN</strong> dan lokasi aktual langsung berpindah ke <strong className="font-semibold">{targetServisName}</strong>. {
                asset.lokasiAlokasiId
                  ? `Namun lokasi alokasi asal (${asalName}) tidak dihapus dan tetap dicatat di sistem.`
                  : 'Setelah servis selesai, aset dapat dikembalikan ke status operasional semula.'
              }
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Wrench}
              isLoading={isSubmitting}
              disabled={!catatan.trim()}
            >
              {isSubmitting ? 'Memproses Servis...' : 'Masuk Servis'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartMaintenanceDialog;

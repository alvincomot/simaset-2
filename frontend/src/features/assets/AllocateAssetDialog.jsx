import React, { useState } from 'react';
import { PackagePlus, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { allocateAssets } from '../../lib/api/allocationApi';
import { useToast } from '../../components/feedback/ToastProvider';

export const AllocateAssetDialog = ({
  isOpen,
  onClose,
  assets = [],
  locations = [],
  onSuccess,
}) => {
  const toast = useToast();
  const [lokasiAlokasiId, setLokasiAlokasiId] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const eligibleAssets = assets.filter(
    (a) =>
      a.statusKetersediaan !== 'DIPINJAM' &&
      a.statusKetersediaan !== 'PEMELIHARAAN' &&
      a.statusKetersediaan !== 'DIALOKASIKAN'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lokasiAlokasiId) {
      setErrorMsg('Pilih ruangan tujuan alokasi terlebih dahulu.');
      return;
    }
    if (eligibleAssets.length === 0) {
      setErrorMsg('Tidak ada aset eligible untuk dialokasikan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const assetIds = eligibleAssets.map((a) => a.id);
      const res = await allocateAssets({
        assetIds,
        lokasiAlokasiId: Number(lokasiAlokasiId),
        catatan: catatan.trim() || undefined,
      });

      const targetLocName =
        locations.find((l) => String(l.id) === String(lokasiAlokasiId))?.namaLokasi ||
        'Ruangan Tujuan';

      toast.success(
        'Alokasi Berhasil',
        `${eligibleAssets.length} aset berhasil dialokasikan ke ${targetLocName}.`
      );

      setLokasiAlokasiId('');
      setCatatan('');
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal melakukan alokasi aset ke lokasi tujuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocationObj = locations.find((l) => String(l.id) === String(lokasiAlokasiId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {assets.length > 1 ? 'Alokasikan Aset Terpilih' : 'Alokasikan Aset'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penempatan fasilitas semi-permanen ke ruangan
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
                <p className="font-semibold">Alokasi Gagal Diproses</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Selected assets summary */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aset yang Akan Dialokasikan ({eligibleAssets.length} dari {assets.length} eligible)
            </label>
            <div className="max-h-36 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {eligibleAssets.map((a) => (
                <div key={a.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{a.namaAset}</p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{a.kodeAset}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                    Siap dialokasi
                  </span>
                </div>
              ))}
              {assets.length > eligibleAssets.length && (
                <div className="py-2 text-rose-600 dark:text-rose-400 font-medium text-center">
                  ⚠️ {assets.length - eligibleAssets.length} aset dilewati karena sedang dipinjam/servis/sudah dialokasikan.
                </div>
              )}
            </div>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Lokasi Tujuan Alokasi <span className="text-rose-500">*</span>
            </label>
            <select
              value={lokasiAlokasiId}
              onChange={(e) => setLokasiAlokasiId(e.target.value)}
              disabled={isSubmitting}
              required
              className="w-full h-12 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">-- Pilih Ruangan / Laboratorium --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.namaLokasi} {loc.deskripsi ? `(${loc.deskripsi})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Catatan Alokasi <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              placeholder="Contoh: Penempatan 25 unit komputer baru untuk fasilitas praktikum Lab Komputer 1"
              className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Confirmation Alert Warning */}
          {selectedLocationObj && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Konfirmasi Aturan Bisnis</span>
              </div>
              <p>
                Aset akan ditetapkan secara semi-permanen ke{' '}
                <strong className="underline">{selectedLocationObj.namaLokasi}</strong>. Setelah
                dialokasikan, aset <strong className="font-semibold">tidak tersedia untuk peminjaman umum</strong> dan statusnya berubah menjadi <span className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">DIALOKASIKAN</span>.
              </p>
            </div>
          )}

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
              icon={CheckCircle2}
              isLoading={isSubmitting}
              disabled={!lokasiAlokasiId || eligibleAssets.length === 0}
            >
              {isSubmitting
                ? 'Mengalokasikan...'
                : `Alokasikan (${eligibleAssets.length} Unit)`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocateAssetDialog;

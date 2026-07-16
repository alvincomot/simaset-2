import React, { useState } from 'react';
import { ArrowRightLeft, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { relocateAssets } from '../../lib/api/allocationApi';
import { useToast } from '../../components/feedback/ToastProvider';

export const RelocateAssetDialog = ({
  isOpen,
  onClose,
  assets = [],
  locations = [],
  onSuccess,
}) => {
  const toast = useToast();
  const [lokasiTujuanId, setLokasiTujuanId] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const eligibleAssets = assets.filter(
    (a) =>
      a.statusKetersediaan === 'DIALOKASIKAN' &&
      a.statusKetersediaan !== 'DIPINJAM' &&
      a.statusKetersediaan !== 'PEMELIHARAAN'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lokasiTujuanId) {
      setErrorMsg('Pilih ruangan tujuan relokasi terlebih dahulu.');
      return;
    }
    if (eligibleAssets.length === 0) {
      setErrorMsg('Tidak ada aset berstatus DIALOKASIKAN untuk direlokasi.');
      return;
    }

    // Cek apakah ada yang dipindahkan ke lokasi yang sama
    const invalidTarget = eligibleAssets.some(
      (a) =>
        String(a.lokasiAlokasiId || a.locationId) === String(lokasiTujuanId)
    );
    if (invalidTarget) {
      setErrorMsg('Relokasi ke lokasi yang sama ditolak. Pilih ruangan lain.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const assetIds = eligibleAssets.map((a) => a.id);
      const res = await relocateAssets({
        assetIds,
        lokasiTujuanId: Number(lokasiTujuanId),
        catatan: catatan.trim() || undefined,
      });

      const targetLocName =
        locations.find((l) => String(l.id) === String(lokasiTujuanId))?.namaLokasi ||
        'Ruangan Tujuan';

      toast.success(
        'Relokasi Berhasil',
        `${eligibleAssets.length} aset berhasil direlokasi ke ${targetLocName}.`
      );

      setLokasiTujuanId('');
      setCatatan('');
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal melakukan relokasi aset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocationObj = locations.find((l) => String(l.id) === String(lokasiTujuanId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {assets.length > 1 ? 'Relokasi Aset Terpilih' : 'Pindahkan Alokasi Aset'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perpindahan lokasi aktual dan lokasi alokasi secara atomik
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
                <p className="font-semibold">Relokasi Gagal Diproses</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Selected assets summary */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aset yang Akan Direlokasi ({eligibleAssets.length} unit)
            </label>
            <div className="max-h-36 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {eligibleAssets.map((a) => (
                <div key={a.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{a.namaAset}</p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {a.kodeAset} · Asal: {a.lokasiAlokasi?.namaLokasi || a.location?.namaLokasi || 'Lokasi Asal'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                    DIALOKASIKAN
                  </span>
                </div>
              ))}
              {assets.length > eligibleAssets.length && (
                <div className="py-2 text-rose-600 dark:text-rose-400 font-medium text-center">
                  ⚠️ {assets.length - eligibleAssets.length} dilewati karena belum berstatus DIALOKASIKAN/sedang servis.
                </div>
              )}
            </div>
          </div>

          {/* Target Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Lokasi Tujuan Baru <span className="text-rose-500">*</span>
            </label>
            <select
              value={lokasiTujuanId}
              onChange={(e) => setLokasiTujuanId(e.target.value)}
              disabled={isSubmitting}
              required
              className="w-full h-12 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">-- Pilih Ruangan / Laboratorium Baru --</option>
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
              Catatan Relokasi <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              placeholder="Contoh: Pemindahan unit PC ke Lab 2 karena penataan ulang ruang kelas"
              className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Summary Confirmation */}
          {selectedLocationObj && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Ringkasan Transaksi Relokasi</span>
              </div>
              <p>
                Lokasi aktual dan lokasi alokasi untuk {eligibleAssets.length} unit akan dipindahkan
                ke <strong className="underline font-semibold">{selectedLocationObj.namaLokasi}</strong>. Status tetap <strong className="font-mono">DIALOKASIKAN</strong> dan riwayat pemindahan dicatat pada audit trail.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
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
              disabled={!lokasiTujuanId || eligibleAssets.length === 0}
            >
              {isSubmitting
                ? 'Memindahkan...'
                : `Pindahkan (${eligibleAssets.length} Unit)`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelocateAssetDialog;

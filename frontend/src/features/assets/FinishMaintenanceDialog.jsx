import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { finishMaintenance } from '../../lib/api/allocationApi';
import { useToast } from '../../components/feedback/ToastProvider';

export const FinishMaintenanceDialog = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const toast = useToast();
  const [kondisiHasil, setKondisiHasil] = useState('BAIK');
  const [catatan, setCatatan] = useState('');
  const [isPhysicalReturned, setIsPhysicalReturned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !asset) return null;

  const lastServisAsal =
    asset.allocationHistories?.[0]?.lokasiAsal?.namaLokasi ||
    (Array.isArray(asset.allocationHistories) &&
      asset.allocationHistories.find((h) => h.jenisKejadian === 'MASUK_SERVIS')?.lokasiAsal?.namaLokasi);

  const asalName = asset.lokasiAlokasi?.namaLokasi || lastServisAsal || asset.location?.namaLokasi || 'Lokasi Asal';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catatan.trim()) {
      setErrorMsg('Catatan hasil servis wajib diisi untuk riwayat pemeriksaan.');
      return;
    }
    if (kondisiHasil === 'BAIK' && !isPhysicalReturned) {
      setErrorMsg('Anda wajib mengonfirmasi bahwa aset telah dikembalikan secara fisik ke lokasi alokasi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await finishMaintenance({
        assetId: asset.id,
        kondisiHasil,
        catatan: catatan.trim(),
      });

      const isAllocatedAsset = !!asset.lokasiAlokasiId;
      if (kondisiHasil === 'BAIK') {
        toast.success(
          'Servis Selesai & Dikembalikan',
          `"${asset.namaAset}" kembali ke status ${
            isAllocatedAsset ? 'DIALOKASIKAN' : 'TERSEDIA'
          } dan berada di ${asalName}.`
        );
      } else {
        toast.info(
          'Hasil Servis: RUSAK',
          `"${asset.namaAset}" tetap berada dalam status PEMELIHARAAN di ruang servis dengan kondisi RUSAK.`
        );
      }

      setCatatan('');
      setIsPhysicalReturned(false);
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyelesaikan pemeliharaan aset.');
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Selesaikan Servis & Kembalikan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyelesaian pemeliharaan dan pengembalian ke ruangan
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
                <p className="font-semibold">Gagal Menyelesaikan Servis</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Asset Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{asset.namaAset}</p>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
                {asset.kodeAset}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tujuan Pengembalian ({asset.lokasiAlokasiId ? 'Lokasi Alokasi' : 'Lokasi Penempatan'}): <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{asalName}</strong>
            </p>
          </div>

          {/* Condition After Service */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kondisi Hasil Servis / Pemeriksaan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKondisiHasil('BAIK')}
                className={`p-3 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ${
                  kondisiHasil === 'BAIK'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="font-bold">BAIK (Siap Pakai)</p>
                  <p className="text-[11px] opacity-80">Kembali ke {asalName}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${kondisiHasil === 'BAIK' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                  {kondisiHasil === 'BAIK' && <span className="text-[10px]">✓</span>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKondisiHasil('RUSAK')}
                className={`p-3 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ${
                  kondisiHasil === 'RUSAK'
                    ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="font-bold">RUSAK (Tetap Servis)</p>
                  <p className="text-[11px] opacity-80">Tetap di Ruang Servis</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${kondisiHasil === 'RUSAK' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'}`}>
                  {kondisiHasil === 'RUSAK' && <span className="text-[10px]">✓</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Required Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Catatan Hasil Servis / Tindakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={isSubmitting}
              required
              rows={3}
              placeholder="Contoh: Penggantian kipas pendingin dan pembersihan debu selesai. Unit beroperasi normal."
              className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Physical Return Checkbox when condition is BAIK */}
          {kondisiHasil === 'BAIK' ? (
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPhysicalReturned}
                onChange={(e) => setIsPhysicalReturned(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Saya mengonfirmasi bahwa aset ini telah <strong className="font-bold">dikembalikan secara fisik ke {asset.lokasiAlokasiId ? 'lokasi alokasi' : 'lokasi semula'} ({asalName})</strong> dan siap digunakan kembali untuk kegiatan operasional.
              </span>
            </label>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs space-y-1">
              <p className="font-bold">Perhatian untuk Kondisi Rusak:</p>
              <p>
                Sistem tidak akan mengembalikan aset ke kondisi operasional ruangan. Status aset akan tetap <strong className="font-mono">PEMELIHARAAN</strong> dan berada di ruang servis sampai tindakan selanjutnya diputuskan.
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
              disabled={!catatan.trim() || (kondisiHasil === 'BAIK' && !isPhysicalReturned)}
            >
              {isSubmitting
                ? 'Memproses...'
                : kondisiHasil === 'BAIK'
                ? 'Selesaikan Servis & Kembalikan'
                : 'Simpan Hasil Pemeriksaan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinishMaintenanceDialog;

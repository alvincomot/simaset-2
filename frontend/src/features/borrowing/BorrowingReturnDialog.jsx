import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Package, User, Calendar, AlertCircle } from 'lucide-react';
import client from '../../lib/api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/feedback/ToastProvider';
import { formatDate } from '../../lib/formatters';

export const BorrowingReturnDialog = ({ isOpen, onClose, borrowing, onSuccess }) => {
  const toast = useToast();

  const [kondisiKembali, setKondisiKembali] = useState('BAIK');
  const [catatanPengembalian, setCatatanPengembalian] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && borrowing) {
      setError('');
      setKondisiKembali('BAIK');
      setCatatanPengembalian('');
    }
  }, [isOpen, borrowing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!borrowing?.id) {
      setError('Data transaksi peminjaman tidak valid.');
      return;
    }

    if (kondisiKembali === 'RUSAK' && !catatanPengembalian.trim()) {
      setError('Catatan pengembalian wajib diisi untuk menjelaskan kerusakan aset.');
      return;
    }

    setIsLoading(true);
    try {
      await client.post(`/borrowing/return/${borrowing.id}`, {
        kondisiKembali,
        catatanPengembalian: catatanPengembalian.trim() || 'Dikembalikan dalam kondisi baik.',
      });

      toast.success(
        'Pengembalian Diproses!',
        `Aset "${borrowing.asset?.namaAset}" telah dikembalikan dengan kondisi akhir: ${kondisiKembali}.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal memproses pengembalian aset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title="Proses Pengembalian Aset (Return)"
      maxWidthClass="max-w-md"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Konfirmasi Pengembalian
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Transaction info box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Aset</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {borrowing?.asset?.namaAset || `Aset ID #${borrowing?.assetId}`}
              </p>
              <p className="font-mono text-slate-500 dark:text-slate-400">
                {borrowing?.asset?.kodeAset}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <User className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Peminjam</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {borrowing?.user?.namaLengkap || `User ID #${borrowing?.userId}`}
              </p>
              <p className="font-mono text-slate-500 dark:text-slate-400">
                NIM: {borrowing?.user?.nim || '-'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="flex justify-between w-full">
              <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Tgl Pinjam</p>
                <p className="text-slate-800 dark:text-slate-200">{formatDate(borrowing?.tanggalPinjam)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Tenggat Waktu</p>
                <p className="text-slate-800 dark:text-slate-200 font-bold">{formatDate(borrowing?.tenggatWaktu)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kondisi Kembali Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Kondisi Fisik Saat Dikembalikan <span className="text-rose-500">*</span>
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setKondisiKembali('BAIK')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                kondisiKembali === 'BAIK'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>BAIK / NORMAL</span>
            </button>

            <button
              type="button"
              onClick={() => setKondisiKembali('RUSAK')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                kondisiKembali === 'RUSAK'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>RUSAK / CACAT</span>
            </button>
          </div>
        </div>

        {/* Catatan Pengembalian */}
        <div>
          <label htmlFor="catatan" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Catatan / Keterangan Pengembalian{' '}
            {kondisiKembali === 'RUSAK' ? <span className="text-rose-500">(Wajib Jika Rusak)</span> : '(Opsional)'}
          </label>
          <textarea
            id="catatan"
            rows={3}
            value={catatanPengembalian}
            onChange={(e) => setCatatanPengembalian(e.target.value)}
            placeholder={
              kondisiKembali === 'RUSAK'
                ? 'Jelaskan detail kerusakan fisik atau kendala teknis pada barang...'
                : 'Contoh: Barang dikembalikan lengkap beserta kabel dan tas peneduh.'
            }
            className="mt-1.5 block w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </form>
    </Modal>
  );
};

export default BorrowingReturnDialog;

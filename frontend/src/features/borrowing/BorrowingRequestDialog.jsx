import React, { useState, useEffect } from 'react';
import { Calendar, Package, AlertCircle } from 'lucide-react';
import client from '../../lib/api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/feedback/ToastProvider';

export const BorrowingRequestDialog = ({ isOpen, onClose, asset, onSuccess }) => {
  const toast = useToast();
  const [tenggatWaktu, setTenggatWaktu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Set default date to 3 days from today when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setTenggatWaktu(`${yyyy}-${mm}-${dd}`);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!asset?.id) {
      setError('Aset tidak valid.');
      return;
    }
    if (!tenggatWaktu) {
      setError('Tenggat waktu pengembalian wajib dipilih.');
      return;
    }

    // Check if tenggatWaktu is in the past
    const selectedDate = new Date(tenggatWaktu);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Tenggat waktu pengembalian tidak boleh tanggal masa lalu.');
      return;
    }

    setIsLoading(true);
    try {
      await client.post('/borrowing/request', {
        assetId: Number(asset.id),
        tenggatWaktu,
      });

      toast.success(
        'Pengajuan Pinjaman Terkirim!',
        `Pengajuan peminjaman untuk "${asset.namaAset}" berhasil dikirim dan menunggu verifikasi admin.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal mengajukan peminjaman aset ini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title="Ajukan Peminjaman Aset"
      maxWidthClass="max-w-md"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Kirim Pengajuan
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

        {/* Asset summary box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aset yang diajukan
            </p>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {asset?.namaAset || 'Nama Aset'}
            </h4>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Kode: {asset?.kodeAset || '-'}
            </p>
          </div>
        </div>

        {/* Tenggat Waktu Input */}
        <div>
          <label htmlFor="tenggatWaktu" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tenggat Waktu Pengembalian <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pilih tanggal maksimal Anda akan mengembalikan barang operasional ini.
          </p>
          <div className="mt-2 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <input
              id="tenggatWaktu"
              type="date"
              required
              value={tenggatWaktu}
              onChange={(e) => setTenggatWaktu(e.target.value)}
              className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
          <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <strong className="font-semibold">Catatan Sistem:</strong> Pengajuan ini akan berstatus <span className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded text-[11px] font-bold">PENDING</span> dan aset belum dapat diambil sebelum disetujui oleh admin atau staf yang bertugas.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default BorrowingRequestDialog;

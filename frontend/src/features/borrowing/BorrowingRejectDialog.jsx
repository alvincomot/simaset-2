import React, { useState, useEffect } from 'react';
import { XCircle, AlertCircle, Package, User } from 'lucide-react';
import client from '../../lib/api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/feedback/ToastProvider';

export const BorrowingRejectDialog = ({ isOpen, onClose, borrowing, onSuccess }) => {
  const toast = useToast();

  const [alasan, setAlasan] = useState('Ditolak oleh admin/staff');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setAlasan('Ditolak oleh admin/staff');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!borrowing?.id) {
      setError('Data peminjaman tidak valid.');
      return;
    }

    setIsLoading(true);
    try {
      await client.post(`/borrowing/reject/${borrowing.id}`, { catatan: alasan });
      toast.success('Peminjaman Ditolak', 'Permintaan peminjaman telah berhasil ditolak.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menolak peminjaman ini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title="Tolak Pengajuan Peminjaman"
      maxWidthClass="max-w-md"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleSubmit} isLoading={isLoading}>
            Tolak Peminjaman
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Peminjam</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{borrowing?.user?.namaLengkap || '-'}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{borrowing?.user?.nim || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Aset yang Diajukan</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{borrowing?.asset?.namaAset || '-'}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{borrowing?.asset?.kodeAset || '-'}</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="alasan" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Alasan Penolakan <span className="text-slate-400 font-normal">(Opsional)</span>
          </label>
          <div className="mt-2 relative">
            <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400">
              <XCircle className="w-5 h-5" />
            </div>
            <textarea
              id="alasan"
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default BorrowingRejectDialog;

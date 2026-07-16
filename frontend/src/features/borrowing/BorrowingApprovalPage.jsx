import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Search, RefreshCw, RotateCcw } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/ToastProvider';
import BorrowingReturnDialog from './BorrowingReturnDialog';
import { formatDate } from '../../lib/formatters';

export const BorrowingApprovalPage = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'PENDING';

  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  // Return dialog state
  const [returningItem, setReturningItem] = useState(null);

  const fetchBorrowings = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get('/borrowing');
      setBorrowings(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data antrian peminjaman.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await client.post(`/borrowing/approve/${id}`);
      toast.success('Peminjaman Disetujui', 'Transaksi telah resmi aktif dan aset berstatus DIPINJAM.');
      fetchBorrowings();
    } catch (err) {
      toast.error('Gagal Menyetujui', err.message || 'Terjadi kesalahan saat verifikasi.');
    } finally {
      setApprovingId(null);
    }
  };

  const filteredList = useMemo(() => {
    if (!Array.isArray(borrowings)) return [];
    return borrowings.filter((b) => {
      const matchStatus = b.statusPeminjaman === statusParam;
      const matchSearch =
        !searchQuery ||
        b.user?.namaLengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.user?.nim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.asset?.namaAset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.asset?.kodeAset?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [borrowings, statusParam, searchQuery]);

  const pendingCount = borrowings.filter((b) => b.statusPeminjaman === 'PENDING').length;
  const activeCount = borrowings.filter((b) => b.statusPeminjaman === 'AKTIF').length;

  if (error) {
    return <ErrorState title="Gagal Memuat Peminjaman" message={error} onRetry={fetchBorrowings} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Antrian Approval & Pengembalian Aset
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Verifikasi pengajuan mahasiswa dan catat kondisi akhir barang saat dikembalikan.
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchBorrowings}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setSearchParams({ status: 'PENDING' })}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            statusParam === 'PENDING'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Antrian PENDING</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-xs">{pendingCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ status: 'AKTIF' })}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            statusParam === 'AKTIF'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Sedang DIPINJAM (Aktif)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-xs">{activeCount}</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama peminjam, NIM, atau kode aset..."
            className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : filteredList.length === 0 ? (
          <EmptyState
            iconName={statusParam === 'PENDING' ? 'Clock' : 'CheckCircle2'}
            title={`Tidak ada antrian ${statusParam}`}
            message={
              statusParam === 'PENDING'
                ? 'Semua pengajuan pinjaman telah diverifikasi atau belum ada permintaan baru.'
                : 'Belum ada aset yang saat ini dalam status aktif dipinjam.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Peminjam</th>
                  <th className="py-3.5 px-6">Aset Inventaris</th>
                  <th className="py-3.5 px-6">Tgl Pinjam</th>
                  <th className="py-3.5 px-6">Tenggat Waktu</th>
                  <th className="py-3.5 px-6 text-right">Tindakan Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{b.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{b.user?.namaLengkap || 'User'}</p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          NIM: {b.user?.nim || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{b.asset?.namaAset || 'Aset'}</p>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {b.asset?.kodeAset || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDate(b.tanggalPinjam)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums font-semibold">
                      {formatDate(b.tenggatWaktu)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {statusParam === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={approvingId === b.id}
                          onClick={() => handleApprove(b.id)}
                          className="shadow-sm"
                        >
                          Approve Pinjaman
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RotateCcw}
                          onClick={() => setReturningItem(b)}
                        >
                          Proses Return
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Dialog */}
      <BorrowingReturnDialog
        isOpen={!!returningItem}
        onClose={() => setReturningItem(null)}
        borrowing={returningItem}
        onSuccess={fetchBorrowings}
      />
    </div>
  );
};

export default BorrowingApprovalPage;

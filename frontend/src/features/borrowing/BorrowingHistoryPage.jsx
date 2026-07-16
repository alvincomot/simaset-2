import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import client from '../../lib/api/client';
import { useAuth } from '../../lib/auth/authContext';
import Button from '../../components/ui/Button';
import ConditionBadge from '../../components/ui/ConditionBadge';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import { formatDate } from '../../lib/formatters';

export const BorrowingHistoryPage = () => {
  const { role } = useAuth();
  const isAdminOrStaff = role === 'SUPER_ADMIN' || role === 'STAFF';

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get('/borrowing');
      const allList = res.data || res || [];
      const finishedOnly = Array.isArray(allList)
        ? allList.filter((b) => b.statusPeminjaman === 'SELESAI')
        : [];
      setHistory(finishedOnly);
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat transaksi selesai.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchUser =
        b.user?.namaLengkap?.toLowerCase().includes(q) || b.user?.nim?.toLowerCase().includes(q);
      const matchAsset =
        b.asset?.namaAset?.toLowerCase().includes(q) || b.asset?.kodeAset?.toLowerCase().includes(q);
      const matchNotes = b.catatan?.toLowerCase().includes(q);

      return matchUser || matchAsset || matchNotes;
    });
  }, [history, searchQuery]);

  if (error) {
    return <ErrorState title="Gagal Memuat Riwayat" message={error} onRetry={fetchHistory} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Riwayat Peminjaman Aset (Selesai)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Arsip lengkap seluruh transaksi peminjaman yang telah resmi dikembalikan dan diverifikasi.
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchHistory}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAdminOrStaff
                ? 'Cari nama peminjam, NIM, atau aset...'
                : 'Cari nama aset atau kode barang...'
            }
            className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} columns={6} />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            iconName="History"
            title="Riwayat Masih Kosong"
            message="Belum ada transaksi peminjaman yang berstatus selesai atau tidak ada item yang cocok dengan pencarian."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">ID</th>
                  {isAdminOrStaff && <th className="py-3.5 px-6">Peminjam</th>}
                  <th className="py-3.5 px-6">Aset Inventaris</th>
                  <th className="py-3.5 px-6">Durasi Pinjam</th>
                  <th className="py-3.5 px-6">Tgl Kembali</th>
                  <th className="py-3.5 px-6">Kondisi Akhir</th>
                  <th className="py-3.5 px-6">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredHistory.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{b.id}
                    </td>
                    {isAdminOrStaff && (
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{b.user?.namaLengkap || 'User'}</p>
                          <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            NIM: {b.user?.nim || '-'}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{b.asset?.namaAset || 'Aset'}</p>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {b.asset?.kodeAset || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                      <p>Pinjam: <strong className="font-semibold">{formatDate(b.tanggalPinjam)}</strong></p>
                      <p className="mt-0.5">Tenggat: <strong className="font-semibold">{formatDate(b.tenggatWaktu)}</strong></p>
                    </td>
                    <td className="py-4 px-6 text-slate-800 dark:text-slate-200 tabular-nums font-bold">
                      {formatDate(b.tanggalKembali)}
                    </td>
                    <td className="py-4 px-6">
                      <ConditionBadge condition={b.kondisiKembali || 'BAIK'} />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={b.catatan}>
                      {b.catatan || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowingHistoryPage;

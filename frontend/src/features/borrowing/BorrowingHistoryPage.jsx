import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, MapPin } from 'lucide-react';
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
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredHistory.map((b) => (
                <div key={b.id} className="flex flex-col gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-slate-300">
                        {b.user?.namaLengkap ? b.user.namaLengkap.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        {isAdminOrStaff ? (
                          <>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{b.user?.namaLengkap || 'User'}</p>
                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">NIM: {b.user?.nim || '-'}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{b.asset?.namaAset || 'Aset'}</p>
                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.asset?.kodeAset || '-'}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <ConditionBadge condition={b.kondisiKembali || 'BAIK'} />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs border border-slate-100 dark:border-slate-800/60 flex flex-col gap-2.5">
                    {isAdminOrStaff && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aset Dipinjam</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.asset?.namaAset || 'Aset'}</p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.asset?.kodeAset || '-'}</p>
                      </div>
                    )}
                    
                    {b.lokasiPenggunaan && (
                      <div className="mt-1 mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1.5 rounded-lg w-fit border border-indigo-200/60 dark:border-indigo-800/50">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Lokasi: {b.lokasiPenggunaan.namaLokasi}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 mt-0.5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Masa Pinjam</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(b.tanggalPinjam)}</p>
                        <p className="text-slate-500 mt-0.5">{formatDate(b.tenggatWaktu)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dikembalikan Pada</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatDate(b.tanggalKembali)}</p>
                      </div>
                    </div>

                    {b.catatan && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 mt-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Catatan</p>
                        <p className="text-slate-600 dark:text-slate-400">{b.catatan}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-16">No</th>
                  {isAdminOrStaff && <th className="py-3.5 px-6">Peminjam</th>}
                  <th className="py-3.5 px-6">Aset Inventaris</th>
                  <th className="py-3.5 px-6">Durasi Pinjam</th>
                  <th className="py-3.5 px-6">Tgl Kembali</th>
                  <th className="py-3.5 px-6">Kondisi Akhir</th>
                  <th className="py-3.5 px-6">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredHistory.map((b, index) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
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
                      {b.lokasiPenggunaan && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-lg w-fit border border-indigo-200/60 dark:border-indigo-800/50">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Dipakai di: {b.lokasiPenggunaan.namaLokasi}</span>
                        </div>
                      )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default BorrowingHistoryPage;

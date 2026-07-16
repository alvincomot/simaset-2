import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import client from '../../lib/api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import { formatDate } from '../../lib/formatters';

export const UserBorrowingsPage = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, AKTIF

  const fetchMyBorrowings = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get('/borrowing');
      setBorrowings(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar pinjaman Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBorrowings();
  }, []);

  const filteredBorrowings = borrowings.filter((b) => {
    if (activeTab === 'ALL') return b.statusPeminjaman === 'PENDING' || b.statusPeminjaman === 'AKTIF';
    return b.statusPeminjaman === activeTab;
  });

  if (error) {
    return <ErrorState title="Gagal Memuat Pinjaman Saya" message={error} onRetry={fetchMyBorrowings} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Pinjaman Aset Saya
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pantau status pengajuan pinjaman dan barang yang saat ini sedang Anda bawa.
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchMyBorrowings}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Semua Aktif ({borrowings.filter((b) => b.statusPeminjaman === 'PENDING' || b.statusPeminjaman === 'AKTIF').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'PENDING'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Pending ({borrowings.filter((b) => b.statusPeminjaman === 'PENDING').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('AKTIF')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'AKTIF'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Sedang Dipinjam ({borrowings.filter((b) => b.statusPeminjaman === 'AKTIF').length})
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : filteredBorrowings.length === 0 ? (
          <EmptyState
            iconName="Clock"
            title="Tidak ada pinjaman aktif"
            message="Anda belum memiliki pengajuan pending atau aset yang sedang dipinjam saat ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Informasi Aset</th>
                  <th className="py-3.5 px-6">Tanggal Pengajuan</th>
                  <th className="py-3.5 px-6">Tenggat Waktu</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredBorrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{b.asset?.namaAset || `Aset ID #${b.assetId}`}</p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Kode: {b.asset?.kodeAset || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDate(b.tanggalPinjam)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums font-semibold">
                      {formatDate(b.tenggatWaktu)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={b.statusPeminjaman} type="borrowing" />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {b.statusPeminjaman === 'PENDING' ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          Menunggu persetujuan admin
                        </span>
                      ) : (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          Silakan ambil / gunakan barang
                        </span>
                      )}
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

export default UserBorrowingsPage;

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Search, RefreshCw, RotateCcw, XCircle, CheckCheck, MapPin } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/ToastProvider';
import BorrowingReturnDialog from './BorrowingReturnDialog';
import BorrowingRejectDialog from './BorrowingRejectDialog';
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
  const [rejectingItem, setRejectingItem] = useState(null);
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
      toast.success('Peminjaman Disetujui', 'Aset sekarang berstatus dipinjam.');
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
  const rejectedCount = borrowings.filter((b) => b.statusPeminjaman === 'DITOLAK').length;
  const finishedCount = borrowings.filter((b) => b.statusPeminjaman === 'SELESAI').length;

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
            Verifikasi pengajuan mahasiswa dan catat kondisi akhir barang saat dikembalikan ke Gudang Sarpras.
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchBorrowings}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
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
          <span>PENDING</span>
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
          <span>DIPINJAM</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-xs">{activeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ status: 'DITOLAK' })}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            statusParam === 'DITOLAK'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>DITOLAK</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-xs">{rejectedCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ status: 'SELESAI' })}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            statusParam === 'SELESAI'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span>SELESAI</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-xs">{finishedCount}</span>
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
            iconName={statusParam === 'PENDING' ? 'Clock' : statusParam === 'AKTIF' ? 'CheckCircle2' : statusParam === 'DITOLAK' ? 'XCircle' : 'CheckCheck'}
            title={`Tidak ada data peminjaman (${statusParam})`}
            message={
              statusParam === 'PENDING'
                ? 'Semua pengajuan pinjaman telah diverifikasi atau belum ada permintaan baru.'
                : statusParam === 'AKTIF'
                ? 'Belum ada aset yang saat ini dalam status aktif dipinjam.'
                : `Belum ada riwayat transaksi peminjaman dengan status ${statusParam}.`
            }
          />
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredList.map((b) => (
                <div key={b.id} className="flex flex-col gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-slate-300">
                        {b.user?.namaLengkap ? b.user.namaLengkap.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{b.user?.namaLengkap || 'User'}</p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">NIM: {b.user?.nim || '-'}</p>
                      </div>
                    </div>
                    {statusParam !== 'PENDING' && statusParam !== 'AKTIF' && (
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        statusParam === 'DITOLAK'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}>
                        {statusParam}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs border border-slate-100 dark:border-slate-800/60 flex flex-col gap-2.5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aset Dipinjam</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.asset?.namaAset || 'Aset'}</p>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.asset?.kodeAset || '-'}</p>
                      {b.lokasiPenggunaan && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1.5 rounded-lg w-fit border border-indigo-200/60 dark:border-indigo-800/50">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Lokasi: {b.lokasiPenggunaan.namaLokasi}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 mt-0.5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tgl Pinjam</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(b.tanggalPinjam)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tenggat Waktu</p>
                        <p className="font-semibold text-rose-600 dark:text-rose-400">{formatDate(b.tenggatWaktu)}</p>
                      </div>
                    </div>
                  </div>

                  {statusParam === 'PENDING' ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button variant="destructive" className="w-full" disabled={approvingId === b.id} onClick={() => setRejectingItem(b)}>
                        Tolak
                      </Button>
                      <Button variant="primary" className="w-full" isLoading={approvingId === b.id} disabled={approvingId === b.id} onClick={() => handleApprove(b.id)}>
                        Approve
                      </Button>
                    </div>
                  ) : statusParam === 'AKTIF' ? (
                    <div className="mt-1">
                      <Button variant="secondary" className="w-full" icon={RotateCcw} onClick={() => setReturningItem(b)}>
                        Proses Pengembalian
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-16">No</th>
                  <th className="py-3.5 px-6">Peminjam</th>
                  <th className="py-3.5 px-6">Aset Inventaris</th>
                  <th className="py-3.5 px-6">Tgl Pinjam</th>
                  <th className="py-3.5 px-6">Tenggat Waktu</th>
                  <th className="py-3.5 px-6 text-right">Tindakan Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredList.map((b, index) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
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
                      {b.lokasiPenggunaan && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-lg w-fit border border-indigo-200/60 dark:border-indigo-800/50">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Dipakai di: {b.lokasiPenggunaan.namaLokasi}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDate(b.tanggalPinjam)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums font-semibold">
                      {formatDate(b.tenggatWaktu)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {statusParam === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={approvingId === b.id}
                            onClick={() => setRejectingItem(b)}
                            className="shadow-sm"
                          >
                            Tolak
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={approvingId === b.id}
                            disabled={approvingId === b.id}
                            onClick={() => handleApprove(b.id)}
                            className="shadow-sm"
                          >
                            Approve
                          </Button>
                        </div>
                      ) : statusParam === 'AKTIF' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RotateCcw}
                          onClick={() => setReturningItem(b)}
                        >
                          Proses Return
                        </Button>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          statusParam === 'DITOLAK'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}>
                          {statusParam}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      {/* Return Dialog */}
      <BorrowingReturnDialog
        isOpen={!!returningItem}
        onClose={() => setReturningItem(null)}
        borrowing={returningItem}
        onSuccess={() => {
          setReturningItem(null);
          fetchBorrowings();
        }}
      />

      <BorrowingRejectDialog
        isOpen={!!rejectingItem}
        onClose={() => setRejectingItem(null)}
        borrowing={rejectingItem}
        onSuccess={() => {
          setRejectingItem(null);
          fetchBorrowings();
        }}
      />
    </div>
  );
};

export default BorrowingApprovalPage;

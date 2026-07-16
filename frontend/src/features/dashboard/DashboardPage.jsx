import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, CheckCircle2, PlusCircle } from 'lucide-react';
import client from '../../lib/api/client';
import { useAuth } from '../../lib/auth/authContext';
import { useToast } from '../../components/feedback/ToastProvider';
import SummaryCard from '../../components/ui/SummaryCard';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import SkeletonCard from '../../components/feedback/SkeletonCard';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import { formatDate } from '../../lib/formatters';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingBorrowings, setIsLoadingBorrowings] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchDashboardData = async () => {
    setError(null);
    setIsLoadingStats(true);
    setIsLoadingBorrowings(true);

    try {
      // Parallel fetch
      const [statsRes, borrowingRes] = await Promise.all([
        client.get('/assets/stats'),
        client.get('/borrowing'),
      ]);

      const statsData = statsRes.data || statsRes;
      const borrowingList = borrowingRes.data || borrowingRes || [];

      setStats({
        totalAssets: statsData.totalAssets ?? 0,
        borrowedAssets: statsData.borrowedAssets ?? 0,
        damageAssets: statsData.damageAssets ?? 0,
      });

      // Filter only PENDING and AKTIF for dashboard preview
      const activeOrPending = Array.isArray(borrowingList)
        ? borrowingList.filter((b) => b.statusPeminjaman === 'PENDING' || b.statusPeminjaman === 'AKTIF').slice(0, 8)
        : [];
      setBorrowings(activeOrPending);
    } catch (err) {
      setError(err.message || 'Gagal memuat data ringkasan dasbor.');
    } finally {
      setIsLoadingStats(false);
      setIsLoadingBorrowings(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    setApprovingId(id);
    try {
      await client.post(`/borrowing/approve/${id}`);
      toast.success('Peminjaman Disetujui', 'Status transaksi menjadi AKTIF dan barang sekarang DIPINJAM.');
      // Refresh stats and queue after server confirmed
      await fetchDashboardData();
    } catch (err) {
      toast.error('Gagal Menyetujui', err.message || 'Terjadi kesalahan saat memproses approval.');
    } finally {
      setApprovingId(null);
    }
  };

  if (error) {
    return <ErrorState title="Gagal Memuat Dasbor" message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Selamat Datang, {user?.namaLengkap} 👋
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ringkasan operasional dan persediaan barang SIMASET secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDashboardData}
            title="Muat ulang data"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/assets?action=create')}
          >
            Tambah Aset Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard count={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SummaryCard
            title="Total Inventaris"
            value={stats?.totalAssets || 0}
            iconName="Package"
            iconColorClass="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
            helperText="Semua aset terdaftar di sistem"
            onClick={() => navigate('/assets')}
          />
          <SummaryCard
            title="Sedang Dipinjam"
            value={stats?.borrowedAssets || 0}
            iconName="Clock"
            iconColorClass="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
            helperText="Aset operasional yang sedang aktif dipinjam"
            onClick={() => navigate('/borrowings?status=AKTIF')}
          />
          <SummaryCard
            title="Aset Rusak"
            value={stats?.damageAssets || 0}
            iconName="AlertTriangle"
            iconColorClass="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
            helperText="Aset dengan kondisi fisik rusak / butuh penanganan"
            onClick={() => navigate('/assets?condition=RUSAK')}
          />
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Antrian & Peminjaman Aktif Terkini
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Menampilkan pengajuan yang menunggu persetujuan atau sedang dipinjam
            </p>
          </div>
          <Link
            to="/borrowings?status=PENDING"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Lihat Semua Antrian</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingBorrowings ? (
          <div className="p-6">
            <SkeletonTable rows={5} columns={5} />
          </div>
        ) : borrowings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Semua Antrian Bersih!</p>
            <p className="text-xs mt-1">Saat ini tidak ada pengajuan pending atau aset yang sedang dipinjam.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Peminjam</th>
                  <th className="py-3.5 px-6">Aset</th>
                  <th className="py-3.5 px-6">Tgl Pinjam</th>
                  <th className="py-3.5 px-6">Tenggat</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {borrowings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                      <div>
                        <p className="font-semibold">{b.user?.namaLengkap || `User ID ${b.userId}`}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          NIM: {b.user?.nim || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {b.asset?.namaAset || `Asset ID ${b.assetId}`}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {b.asset?.kodeAset || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDate(b.tanggalPinjam)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDate(b.tenggatWaktu)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={b.statusPeminjaman} type="borrowing" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.statusPeminjaman === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={approvingId === b.id}
                          onClick={(e) => handleApprove(b.id, e)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/borrowings?status=AKTIF`)}
                        >
                          Kelola Return
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
    </div>
  );
};

export default DashboardPage;

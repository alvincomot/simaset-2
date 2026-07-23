import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, RefreshCw, Filter } from 'lucide-react';
import { getAllocationHistory } from '../../lib/api/allocationApi';
import { jenisKejadianMap } from '../../lib/constants';
import Button from '../../components/ui/Button';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';

export const AllocationHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKejadian, setSelectedKejadian] = useState('ALL');

  const fetchHistory = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await getAllocationHistory();
      const data = res.data || res || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil riwayat audit alokasi dan pemeliharaan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.asset?.namaAset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.asset?.kodeAset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user?.namaLengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.catatan?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKejadian =
        selectedKejadian === 'ALL' || item.jenisKejadian === selectedKejadian;

      return matchSearch && matchKejadian;
    });
  }, [history, searchQuery, selectedKejadian]);

  if (error) {
    return <ErrorState title="Gagal Memuat Riwayat Alokasi" message={error} onRetry={fetchHistory} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Riwayat Audit Alokasi & Servis</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Rekam jejak atomik untuk seluruh aktivitas alokasi, relokasi, masuk pemeliharaan, dan penyelesaian servis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchHistory}
            title="Muat ulang riwayat"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama aset, kode aset, nama petugas, atau catatan..."
              className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <div className="sm:w-64 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedKejadian}
              onChange={(e) => setSelectedKejadian(e.target.value)}
              className="h-11 w-full px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Jenis Kejadian</option>
              <option value="ALOKASI">Alokasi ke Lokasi</option>
              <option value="RELOKASI">Relokasi Aset</option>
              <option value="MASUK_SERVIS">Masuk Pemeliharaan</option>
              <option value="SELESAI_SERVIS">Selesai Servis & Kembali</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            iconName="History"
            title="Belum ada riwayat alokasi"
            message="Belum tercatat aktivitas alokasi, relokasi, atau servis yang sesuai filter pencarian Anda."
          />
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredHistory.map((item) => {
                const infoKejadian = jenisKejadianMap[item.jenisKejadian] || {
                  label: item.jenisKejadian,
                  badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                };
                const tgl = new Date(item.createdAt || item.waktu || 0);

                return (
                  <div key={item.id} className="flex flex-col gap-3 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{item.asset?.namaAset || 'Aset #' + item.assetId}</p>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.asset?.kodeAset || '-'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${infoKejadian.badgeClass}`}>
                          {infoKejadian.label}
                        </span>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs border border-slate-100 dark:border-slate-800/60">
                      <div className="grid grid-cols-2 gap-3 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700/60">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pelaku</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{item.user?.namaLengkap || 'Staff'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-500">{item.user?.role || item.user?.nim || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lokasi</p>
                          {item.lokasiAsal && item.lokasiTujuan ? (
                            <div className="flex flex-col gap-0.5 text-[11px]">
                              <span className="font-medium text-slate-500 line-through decoration-slate-400">{item.lokasiAsal.namaLokasi}</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100">{item.lokasiTujuan.namaLokasi}</span>
                            </div>
                          ) : item.lokasiTujuan ? (
                            <span className="font-bold text-slate-900 dark:text-slate-100">{item.lokasiTujuan.namaLokasi}</span>
                          ) : item.lokasiAsal ? (
                            <span className="font-medium text-slate-500 line-through decoration-slate-400">{item.lokasiAsal.namaLokasi}</span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Catatan</p>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{item.catatan || '-'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Waktu Kejadian</th>
                  <th className="py-3.5 px-6">Aset</th>
                  <th className="py-3.5 px-6">Aktivitas</th>
                  <th className="py-3.5 px-6">Perpindahan Lokasi</th>
                  <th className="py-3.5 px-6">Dilakukan Oleh</th>
                  <th className="py-3.5 px-6">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredHistory.map((item) => {
                  const infoKejadian = jenisKejadianMap[item.jenisKejadian] || {
                    label: item.jenisKejadian,
                    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                  };
                  const tgl = new Date(item.createdAt || item.waktu || 0);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {tgl.toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {tgl.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {item.asset?.namaAset || 'Aset #' + item.assetId}
                          </p>
                          <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.asset?.kodeAset || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${infoKejadian.badgeClass}`}
                        >
                          {infoKejadian.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-xs">
                        {item.lokasiAsal && item.lokasiTujuan ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              {item.lokasiAsal.namaLokasi}
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">→</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {item.lokasiTujuan.namaLokasi}
                            </span>
                          </div>
                        ) : item.lokasiTujuan ? (
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {item.lokasiTujuan.namaLokasi}
                          </span>
                        ) : item.lokasiAsal ? (
                          <span className="text-slate-500 dark:text-slate-400">
                            {item.lokasiAsal.namaLokasi}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.user?.namaLengkap || 'Staff'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">
                            {item.user?.role || item.user?.nim || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {item.catatan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllocationHistoryPage;

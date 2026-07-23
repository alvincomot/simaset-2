import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, RefreshCw, Layers } from 'lucide-react';
import { getLocationSummary } from '../../lib/api/allocationApi';
import Button from '../../components/ui/Button';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';

export const LocationSummaryPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSummary = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await getLocationSummary();
      const data = res.data || res || [];
      setSummaries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil ringkasan alokasi dan aktual per lokasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const filteredSummaries = useMemo(() => {
    if (!Array.isArray(summaries)) return [];
    return summaries.filter((s) => {
      if (!searchQuery) return true;
      return s.namaLokasi?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [summaries, searchQuery]);

  if (error) {
    return <ErrorState title="Gagal Memuat Ringkasan Lokasi" message={error} onRetry={fetchSummary} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Ringkasan Aset per Lokasi</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantauan distribusi dan ketersediaan aset di setiap ruangan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchSummary}
            title="Muat ulang ringkasan"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama ruangan atau laboratorium..."
            className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : filteredSummaries.length === 0 ? (
          <EmptyState
            iconName="MapPin"
            title="Tidak ada lokasi ditemukan"
            message="Belum ada data master lokasi atau ruangan yang cocok dengan pencarian Anda."
          />
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSummaries.map((loc) => {
                const kondisi = loc.kondisi || { baik: 0, rusak: 0 };
                const status = loc.statusKetersediaan || { tersedia: 0, dipinjam: 0, pemeliharaan: 0, dialokasikan: 0 };

                return (
                  <div key={loc.id} className="flex flex-col gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{loc.namaLokasi}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID Lokasi: #{loc.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Aset Aktual</p>
                        <div>
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-700 font-bold text-slate-900 dark:text-slate-100 text-base">
                            {loc.totalActualAssets || 0}
                          </span>
                        </div>
                      </div>
                      <div className="bg-purple-50/50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800/60 text-center flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-purple-600/80 dark:text-purple-400/80 uppercase tracking-wider mb-1.5">Aset Dialokasikan</p>
                        <div>
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 font-bold text-purple-700 dark:text-purple-300 text-base">
                            {loc.totalAllocatedAssets || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">Kondisi Fisik</p>
                        <div className="flex items-center justify-between">
                          <span className="text-teal-700 dark:text-teal-400 font-semibold">BAIK:</span>
                          <span className="font-mono font-bold">{kondisi.baik || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-rose-700 dark:text-rose-400 font-semibold">RUSAK:</span>
                          <span className="font-mono font-bold">{kondisi.rusak || 0}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 font-mono">
                        <p className="font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">Distribusi Status</p>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600 dark:text-emerald-400">Tersedia:</span>
                          <strong>{status.tersedia || 0}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-600 dark:text-purple-400">Alokasi:</span>
                          <strong>{status.dialokasikan || 0}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 dark:text-blue-400">Dipinjam:</span>
                          <strong>{status.dipinjam || 0}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-amber-600 dark:text-amber-400">Servis:</span>
                          <strong>{status.pemeliharaan || 0}</strong>
                        </div>
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
                  <th className="py-3.5 px-6">Nama Lokasi / Ruangan</th>
                  <th className="py-3.5 px-6 text-center">Aset Aktual (Fisik)</th>
                  <th className="py-3.5 px-6 text-center">Aset Dialokasikan</th>
                  <th className="py-3.5 px-6">Distribusi Kondisi</th>
                  <th className="py-3.5 px-6">Distribusi Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredSummaries.map((loc) => {
                  const kondisi = loc.kondisi || { baik: 0, rusak: 0 };
                  const status = loc.statusKetersediaan || { tersedia: 0, dipinjam: 0, pemeliharaan: 0, dialokasikan: 0 };

                  return (
                    <tr
                      key={loc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{loc.namaLokasi}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ID Lokasi: #{loc.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-base">
                          {loc.totalActualAssets || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 font-bold text-purple-700 dark:text-purple-300 text-base">
                          {loc.totalAllocatedAssets || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-teal-700 dark:text-teal-400 font-semibold">BAIK:</span>
                          <span className="font-mono font-bold">{kondisi.baik || 0}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-rose-700 dark:text-rose-400 font-semibold">RUSAK:</span>
                          <span className="font-mono font-bold">{kondisi.rusak || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs space-y-1">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                          <div>
                            <span className="text-emerald-600 dark:text-emerald-400">Tersedia: </span>
                            <strong>{status.tersedia || 0}</strong>
                          </div>
                          <div>
                            <span className="text-purple-600 dark:text-purple-400">Alokasi: </span>
                            <strong>{status.dialokasikan || 0}</strong>
                          </div>
                          <div>
                            <span className="text-blue-600 dark:text-blue-400">Dipinjam: </span>
                            <strong>{status.dipinjam || 0}</strong>
                          </div>
                          <div>
                            <span className="text-amber-600 dark:text-amber-400">Servis : </span>
                            <strong>{status.pemeliharaan || 0}</strong>
                          </div>
                        </div>
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

export default LocationSummaryPage;

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, RefreshCw } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SkeletonTable from '../../components/feedback/SkeletonTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/ToastProvider';

export const LocationsPage = () => {
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formName, setFormName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete states
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchLocations = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get('/masters/locations');
      setLocations(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat master data lokasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreate = () => {
    setEditingLocation(null);
    setFormName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (loc) => {
    setEditingLocation(loc);
    setFormName(loc.namaLokasi || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim()) {
      setFormError('Nama lokasi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLocation) {
        await client.put(`/masters/locations/${editingLocation.id}`, {
          namaLokasi: formName.trim(),
        });
        toast.success('Lokasi Diperbarui', `Lokasi berhasil diubah menjadi "${formName.trim()}".`);
      } else {
        await client.post('/masters/locations', {
          namaLokasi: formName.trim(),
        });
        toast.success('Lokasi Ditambahkan', `"${formName.trim()}" telah ditambahkan ke master lokasi.`);
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data lokasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLocation) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await client.delete(`/masters/locations/${deletingLocation.id}`);
      toast.success('Lokasi Dihapus', `"${deletingLocation.namaLokasi}" telah dihapus dari daftar.`);
      setDeletingLocation(null);
      fetchLocations();
    } catch (err) {
      const msg = err.message || 'Lokasi ini sedang digunakan oleh aset inventaris dan tidak dapat dihapus.';
      setDeleteError(msg);
      toast.error('Gagal Menghapus Lokasi', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLocations = locations.filter(
    (l) => !searchQuery || l.namaLokasi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <ErrorState title="Gagal Memuat Lokasi" message={error} onRetry={fetchLocations} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Master Data Lokasi Penempatan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola gedung, ruangan, laboratorium, atau area penempatan barang inventaris di SIMASET.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchLocations}>
            Refresh
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={openCreate}>
            Tambah Lokasi
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
            placeholder="Cari nama gedung atau ruangan..."
            className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} columns={3} />
        ) : filteredLocations.length === 0 ? (
          <EmptyState
            iconName="MapPin"
            title="Lokasi Tidak Ditemukan"
            message="Belum ada data lokasi tersimpan atau hasil pencarian kosong."
            actionLabel="Tambah Lokasi Baru"
            onAction={openCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-16">No</th>
                  <th className="py-3.5 px-6">Nama Lokasi</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredLocations.map((loc, index) => (
                  <tr key={loc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                      {loc.namaLokasi}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(loc)}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="Edit lokasi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError('');
                          setDeletingLocation(loc);
                        }}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Hapus lokasi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={!isSubmitting ? () => setIsModalOpen(false) : undefined}
        title={editingLocation ? 'Edit Lokasi Aset' : 'Tambah Lokasi Baru'}
        maxWidthClass="max-w-md"
        closeOnBackdrop={!isSubmitting}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} isLoading={isSubmitting}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{formError}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Nama Lokasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Gedung F - Lantai 3, Gudang Utama..."
              className="mt-1.5 block w-full px-3.5 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Lokasi Penempatan"
        message={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus lokasi ini dari daftar master data?`
        }
        targetName={deletingLocation?.namaLokasi}
        confirmLabel="Ya, Hapus Lokasi"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LocationsPage;

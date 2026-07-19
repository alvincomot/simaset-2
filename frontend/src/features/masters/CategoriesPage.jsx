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

export const CategoriesPage = () => {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete states
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCategories = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await client.get('/masters/categories');
      setCategories(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat master data kategori.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.namaKategori || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await client.put(`/masters/categories/${editingCategory.id}`, {
          namaKategori: formName.trim(),
        });
        toast.success('Kategori Diperbarui', `Kategori berhasil diubah menjadi "${formName.trim()}".`);
      } else {
        await client.post('/masters/categories', {
          namaKategori: formName.trim(),
        });
        toast.success('Kategori Ditambahkan', `"${formName.trim()}" telah ditambahkan ke master data.`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await client.delete(`/masters/categories/${deletingCategory.id}`);
      toast.success('Kategori Dihapus', `"${deletingCategory.namaKategori}" telah dihapus.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      const msg = err.message || 'Kategori ini digunakan oleh aset inventaris dan tidak dapat dihapus.';
      setDeleteError(msg);
      toast.error('Gagal Menghapus Kategori', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => !searchQuery || c.namaKategori?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <ErrorState title="Gagal Memuat Kategori" message={error} onRetry={fetchCategories} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Master Data Kategori Aset
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola klasifikasi atau jenis barang inventaris yang tersedia di SIMASET.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchCategories}>
            Refresh
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={openCreate}>
            Tambah Kategori
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
            placeholder="Cari nama kategori..."
            className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} columns={3} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            iconName="Tags"
            title="Kategori Tidak Ditemukan"
            message="Belum ada data kategori tersimpan atau hasil pencarian kosong."
            actionLabel="Tambah Kategori Baru"
            onAction={openCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-16">No</th>
                  <th className="py-3.5 px-6">Nama Kategori</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                      {cat.namaKategori}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="Edit kategori"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError('');
                          setDeletingCategory(cat);
                        }}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Hapus kategori"
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
        title={editingCategory ? 'Edit Kategori Aset' : 'Tambah Kategori Baru'}
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
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Elektronik & IT, Laboratorium..."
              className="mt-1.5 block w-full px-3.5 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Kategori"
        message={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus kategori ini? Aset yang menggunakan kategori ini mungkin terpengaruh.`
        }
        targetName={deletingCategory?.namaKategori}
        confirmLabel="Ya, Hapus Kategori"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoriesPage;

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import client from '../../lib/api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/feedback/ToastProvider';

export const EditAssetDialog = ({ isOpen, onClose, asset, categories = [], locations = [], onSuccess }) => {
  const toast = useToast();

  const [namaAset, setNamaAset] = useState('');
  const [kodeAset, setKodeAset] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [kondisi, setKondisi] = useState('BAIK');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && asset) {
      setError('');
      setNamaAset(asset.namaAset || '');
      setKodeAset(asset.kodeAset || '');
      setCategoryId(String(asset.categoryId || ''));
      setLocationId(String(asset.locationId || ''));
      setKondisi(asset.kondisi || 'BAIK');
    }
  }, [isOpen, asset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!asset?.id) {
      setError('Aset tidak valid.');
      return;
    }
    if (!namaAset.trim() || !kodeAset.trim() || !categoryId || !locationId) {
      setError('Semua kolom wajib diisi lengkap.');
      return;
    }

    setIsLoading(true);
    try {
      await client.put(`/assets/${asset.id}`, {
        namaAset: namaAset.trim(),
        kodeAset: kodeAset.trim(),
        kondisi,
        categoryId: Number(categoryId),
        locationId: Number(locationId),
      });

      toast.success('Aset Diperbarui', `Perubahan pada "${namaAset.trim()}" berhasil disimpan.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal memperbarui spesifikasi aset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title="Edit Spesifikasi Aset"
      maxWidthClass="max-w-md"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Nama Aset <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={namaAset}
            onChange={(e) => setNamaAset(e.target.value)}
            placeholder="Contoh: Proyektor Epson EB-X06"
            className="mt-1 block w-full px-3.5 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Kode Aset <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled
            value={kodeAset}
            className="mt-1 block w-full px-3.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-mono text-sm cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full px-3 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.namaKategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Lokasi Penempatan <span className="text-rose-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="mt-1 block w-full px-3 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">-- Pilih Lokasi --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.namaLokasi}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Kondisi Fisik
          </label>
          <select
            value={kondisi}
            onChange={(e) => setKondisi(e.target.value)}
            className="mt-1 block w-full px-3 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="BAIK">Baik</option>
            <option value="RUSAK">Rusak</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default EditAssetDialog;

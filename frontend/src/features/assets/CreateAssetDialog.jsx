import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import client from '../../lib/api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/feedback/ToastProvider';

export const CreateAssetDialog = ({ isOpen, onClose, categories = [], locations = [], onSuccess }) => {
  const toast = useToast();

  const [namaAset, setNamaAset] = useState('');
  const [kodeAset, setKodeAset] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [kondisi, setKondisi] = useState('BAIK');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setNamaAset('');
      setKodeAset('');
      setKondisi('BAIK');
      if (categories.length > 0) setCategoryId(String(categories[0].id));
      if (locations.length > 0) setLocationId(String(locations[0].id));
    }
  }, [isOpen, categories, locations]);

  const generateKode = () => {
    const prefix = 'AST';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const suffix = String(Date.now()).slice(-3);
    setKodeAset(`${prefix}-${rand}-${suffix}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!namaAset.trim() || !kodeAset.trim() || !categoryId || !locationId) {
      setError('Semua kolom wajib diisi lengkap.');
      return;
    }

    setIsLoading(true);
    try {
      await client.post('/assets', {
        namaAset: namaAset.trim(),
        kodeAset: kodeAset.trim(),
        statusKetersediaan: 'TERSEDIA',
        kondisi,
        categoryId: Number(categoryId),
        locationId: Number(locationId),
      });

      toast.success('Aset Berhasil Ditambahkan', `"${namaAset.trim()}" telah masuk dalam inventaris.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan aset baru.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title="Tambah Aset Inventaris Baru"
      maxWidthClass="max-w-lg"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Simpan Aset
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
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kode Aset <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={generateKode}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Otomatis</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={kodeAset}
            onChange={(e) => setKodeAset(e.target.value)}
            placeholder="Contoh: AST-1024-889"
            className="mt-1 block w-full px-3.5 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
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

export default CreateAssetDialog;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';

export const RegisterPage = () => {
  const [nim, setNim] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nim.trim() || !namaLengkap.trim() || !password || !confirmPassword) {
      setError('Semua kolom wajib diisi lengkap.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await client.post('/auth/register', {
        nim: nim.trim(),
        namaLengkap: namaLengkap.trim(),
        password,
      });

      setSuccessData({
        nim: nim.trim(),
        namaLengkap: namaLengkap.trim(),
        email: `${nim.trim()}@student.uksw.edu`,
        message: res.message || `Link verifikasi telah dikirimkan ke email ${nim.trim()}@student.uksw.edu`,
      });
    } catch (err) {
      setError(err.message || 'Gagal melakukan pendaftaran akun baru.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          Daftar Akun Mahasiswa
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Buat akun untuk meminjam fasilitas milik universitas.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 rounded-3xl">
          {successData ? (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col items-center gap-3 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-base font-bold">Pendaftaran Berhasil! Cek Email Anda</h4>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  Kami telah mengirimkan tautan verifikasi ke alamat email resmi kampus Anda:
                  <br />
                  <strong className="font-mono text-emerald-900 dark:text-emerald-100 mt-1 block font-bold">
                    {successData.email}
                  </strong>
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">📌 Langkah Selanjutnya:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Buka kotak masuk (Inbox) atau folder Spam pada email kampus Anda.</li>
                  <li>Klik tombol atau tautan <strong>Verifikasi Akun Sekarang</strong>.</li>
                  <li>Setelah terverifikasi, Anda dapat langsung masuk melalui halaman Login.</li>
                </ol>
              </div>
              <Link to="/login" className="block">
                <Button variant="primary" className="w-full" icon={ArrowLeft}>
                  Menuju Halaman Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="nim" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  NIM / Nomor Induk Mahasiswa<span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <input
                    id="nim"
                    name="nim"
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="block w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Email verifikasi akan otomatis dikirim ke <strong>Email Student.</strong>
                </p>
              </div>

              <div>
                <label htmlFor="namaLengkap" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="block w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full font-bold"
                >
                  Daftar
                </Button>
              </div>

              <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sudah memiliki akun SIMASET?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline transition-colors"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

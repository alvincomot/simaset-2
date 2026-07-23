import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth/authContext';
import Button from '../../components/ui/Button';

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nim.trim() || !password.trim()) {
      setError('NIM dan Password wajib diisi.');
      return;
    }

    const result = await login(nim.trim(), password);
    if (result.success) {
      if (result.user.role === 'SUPER_ADMIN' || result.user.role === 'STAFF') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/catalog', { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Box className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          Masuk ke SIMASET
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sistem Informasi Manajemen Aset Operasional & Inventaris
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="nim" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                NIM / Nomor Induk Mahasiswa
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
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
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="mt-2 relative rounded-xl shadow-sm">
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
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Masuk
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Belum memiliki akun SIMASET?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline transition-colors"
              >
                Daftar Akun Sekarang
              </Link>
            </p>
          </div>

          {/* Quick login hint for dev/demo */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Akun Demo Tersedia:
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <span
                onClick={() => { setNim('01'); setPassword('admin123'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Klik untuk mengisi otomatis"
              >
                Admin (01 / admin123)
              </span>
              <span
                onClick={() => { setNim('02'); setPassword('staff123'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Klik untuk mengisi otomatis"
              >
                Staff (02 / staff123)
              </span>
              <span
                onClick={() => { setNim('03'); setPassword('user123'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Klik untuk mengisi otomatis"
              >
                Mahasiswa (03 / user123)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

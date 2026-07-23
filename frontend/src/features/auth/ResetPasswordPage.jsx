import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Kata sandi baru wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await client.post(`/auth/reset-password/${token}`, {
        newPassword: newPassword.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Token tidak valid atau sudah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          Buat Kata Sandi Baru
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Masukkan sandi baru Anda untuk memulihkan akses ke SIMASET.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 rounded-3xl">
          {isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col items-center gap-3 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-base font-bold">Kata Sandi Berhasil Diperbarui!</h4>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  Anda akan dialihkan ke halaman login secara otomatis dalam beberapa saat...
                </p>
              </div>
              <Link to="/login" className="block">
                <Button variant="primary" className="w-full">
                  Langsung ke Halaman Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi Baru
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
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

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Simpan Kata Sandi Baru
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Batal & Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

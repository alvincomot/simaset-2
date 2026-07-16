import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';

export const ForgotPasswordPage = () => {
  const [nim, setNim] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!nim.trim()) {
      setError('NIM wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await client.post('/auth/forgot-password', { nim: nim.trim() });
      const msg = res.message || `Link reset password berhasil dikirim ke ${nim.trim()}@student.uksw.edu`;
      setSuccessMsg(msg);
    } catch (err) {
      setError(err.message || 'Gagal mengirim email pemulihan sandi.');
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
          Lupa Kata Sandi
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Masukkan NIM Anda untuk menerima tautan pembaruan kata sandi di email kampus Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 rounded-3xl">
          {successMsg ? (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col items-center gap-3 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-base font-bold">Instruksi Terkirim!</h4>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {successMsg}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan periksa kotak masuk (atau folder spam/junk) email kampus Anda sekarang. Tautan berlaku selama 15 menit.
              </p>
              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full" icon={ArrowLeft}>
                  Kembali ke Halaman Login
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
                <label htmlFor="nim" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  NIM terdaftar
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="nim"
                    name="nim"
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 672023037"
                    className="block w-full pl-11 pr-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
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
                  Kirim Tautan Reset
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Halaman Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

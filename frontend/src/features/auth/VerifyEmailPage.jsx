import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import client from '../../lib/api/client';
import Button from '../../components/ui/Button';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Sedang memproses aktivasi dan verifikasi akun Anda...');

  useEffect(() => {
    let isMounted = true;
    if (token) {
      client
        .get(`/auth/verify-email/${token}`)
        .then((res) => {
          if (isMounted) {
            setStatus('success');
            setMessage(res.message || 'Akun berhasil diverifikasi, silakan login');
          }
        })
        .catch((err) => {
          if (isMounted) {
            setStatus('error');
            setMessage(err.message || 'Token verifikasi tidak valid atau sudah kedaluwarsa.');
          }
        });
    } else {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan dalam tautan ini.');
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
            status === 'success'
              ? 'bg-emerald-600 shadow-emerald-600/30 text-white'
              : status === 'error'
              ? 'bg-rose-600 shadow-rose-600/30 text-white'
              : 'bg-indigo-600 shadow-indigo-600/30 text-white'
          }`}>
            {status === 'loading' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : status === 'success' ? (
              <ShieldCheck className="w-9 h-9" />
            ) : (
              <AlertCircle className="w-9 h-9" />
            )}
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          Verifikasi Akun SIMASET
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Aktivasi hak akses peminjaman fasilitas laboratorium.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 sm:px-10 shadow-xl shadow-slate-950/5 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-6">
          {status === 'loading' ? (
            <div className="py-6 space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {message}
              </p>
            </div>
          ) : status === 'success' ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col items-center gap-3 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                  Akun berhasil diverifikasi, silakan login
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Selamat! Email institusi Anda telah terverifikasi. Hak akses mahasiswa untuk peminjaman aset dan fasilitas laboratorium kini sudah aktif sepenuhnya.
                </p>
              </div>

              <Link to="/login" className="block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-bold shadow-md shadow-emerald-600/20"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Menuju Halaman Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex flex-col items-center gap-3 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-12 h-12 text-rose-600 dark:text-rose-400 shrink-0" />
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-100">
                  Gagal Memverifikasi Akun
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Daftar Ulang
                  </Button>
                </Link>
                <Link to="/login" className="flex-1">
                  <Button variant="primary" className="w-full">
                    Ke Halaman Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

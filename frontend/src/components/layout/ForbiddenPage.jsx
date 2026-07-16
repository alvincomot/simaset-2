import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../lib/auth/authContext';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleReturn = () => {
    if (role === 'SUPER_ADMIN' || role === 'STAFF') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/catalog', { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
        403 - Akses Ditolak
      </h1>
      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
        Maaf, Anda tidak memiliki hak akses yang cukup untuk melihat atau melakukan tindakan pada halaman ini.
      </p>
      <div className="mt-8">
        <Button variant="primary" onClick={handleReturn}>
          Kembali ke Beranda Utama
        </Button>
      </div>
    </div>
  );
};

export default ForbiddenPage;

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  isLoading = false,
  variant = 'destructive',
  targetName = '',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title={title}
      maxWidthClass="max-w-md"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
          {targetName && (
            <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100">
              {targetName}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

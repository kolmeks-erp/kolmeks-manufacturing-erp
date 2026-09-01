import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  confirmVariant?: string;
  cancelText?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmLabel,
  cancelText = 'Cancel',
  cancelLabel,
  isDangerous = false,
  isLoading = false,
}) => {
  const handleClose = onClose || onCancel || (() => {});
  const finalConfirmText = confirmLabel || confirmText;
  const finalCancelText = cancelLabel || cancelText;
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isDangerous ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {finalCancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            disabled={isLoading}
            className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0B1E36] hover:bg-[#0F2C59]'
            }`}
          >
            {isLoading ? 'Processing...' : finalConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

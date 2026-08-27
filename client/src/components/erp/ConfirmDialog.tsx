import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
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
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0B1E36] hover:bg-[#0F2C59]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

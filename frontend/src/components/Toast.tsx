import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="toast-container">
      <div className={`toast-card ${toast.type}`}>
        {isSuccess ? (
          <CheckCircle2 className="toast-icon success" size={20} />
        ) : (
          <AlertCircle className="toast-icon error" size={20} />
        )}
        <span className="toast-text">{toast.text}</span>
        <button className="toast-close" onClick={onClose} aria-label="Fechar aviso">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const baseToastOptions = {
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  customClass: {
    popup: 'rounded-2xl border shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 font-sans',
    title: 'text-sm font-semibold',
    htmlContainer: 'text-sm',
  },
} as const;

const toastStyleMap = {
  success: {
    iconColor: 'var(--success-text)',
    background: 'var(--success-bg)',
    color: 'var(--success-text)',
  },
  error: {
    iconColor: 'var(--error-text)',
    background: 'var(--error-bg)',
    color: 'var(--error-text)',
  },
  warning: {
    iconColor: 'var(--warning-text)',
    background: 'var(--warning-bg)',
    color: 'var(--warning-text)',
  },
  info: {
    iconColor: 'var(--info-text)',
    background: 'var(--info-bg)',
    color: 'var(--info-text)',
  },
} as const;

type ToastType = keyof typeof toastStyleMap;
type ToastMessage = string;

async function triggerToast(type: ToastType, message: ToastMessage) {
  if (typeof window === 'undefined') {
    return;
  }

  const { default: Swal } = await import('sweetalert2');
  void Swal.fire({
    ...baseToastOptions,
    icon: type,
    title: message,
    ...toastStyleMap[type],
  });
}

const toast = {
  success(message: ToastMessage) {
    void triggerToast('success', message);
  },
  error(message: ToastMessage) {
    void triggerToast('error', message);
  },
  warning(message: ToastMessage) {
    void triggerToast('warning', message);
  },
  info(message: ToastMessage) {
    void triggerToast('info', message);
  },
};

export async function triggerAlert({
  icon = 'info',
  title,
  text,
  confirmButtonText = 'យល់ព្រម',
  showCancelButton = false,
  cancelButtonText = 'បោះបង់',
}: {
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  title: string;
  text?: string;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
}) {
  if (typeof window === 'undefined') return { isConfirmed: false };

  const { default: Swal } = await import('sweetalert2');
  return Swal.fire({
    icon,
    title,
    text,
    confirmButtonText,
    showCancelButton,
    cancelButtonText,
    customClass: {
      popup: 'rounded-3xl border border-slate-200 shadow-2xl p-6 font-sans',
      title: 'text-base font-bold text-slate-800 leading-relaxed font-sans',
      htmlContainer: 'text-sm text-slate-600 leading-relaxed mt-2 font-sans',
      confirmButton:
        'bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm mx-1.5 focus:outline-none cursor-pointer',
      cancelButton:
        'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-xl text-sm transition-all mx-1.5 focus:outline-none cursor-pointer',
    },
    buttonsStyling: false,
  });
}

const showAlert = {
  success(title: string, text?: string) {
    return triggerAlert({ icon: 'success', title, text });
  },
  error(title: string, text?: string) {
    return triggerAlert({ icon: 'error', title, text });
  },
  warning(title: string, text?: string) {
    return triggerAlert({ icon: 'warning', title, text });
  },
  info(title: string, text?: string) {
    return triggerAlert({ icon: 'info', title, text });
  },
  confirm(title: string, text?: string, confirmText?: string) {
    return triggerAlert({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText || 'យល់ព្រម',
      cancelButtonText: 'បោះបង់',
    });
  },
};

export { toast, showAlert };

const baseToastOptions = {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 4500,
  timerProgressBar: true,
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  customClass: {
    popup: 'rounded-2xl border shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5',
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

export { toast };

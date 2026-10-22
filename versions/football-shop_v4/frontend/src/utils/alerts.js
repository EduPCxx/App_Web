import Swal from 'sweetalert2';

// SweetAlert2 con estilo minimalista (botones propios con clases de Tailwind)
const Alert = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: '!rounded-lg !border !border-border !shadow-none !font-sans',
    title: '!text-lg !font-semibold !text-foreground',
    htmlContainer: '!text-sm !text-muted-foreground',
    confirmButton: 'mx-1 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90',
    cancelButton: 'mx-1 h-9 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-muted'
  }
});

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Muestra errores ya normalizados por toApiError (red, HTTP, validación del servidor).
// El texto se escapa: los mensajes del servidor pueden reflejar datos de la petición.
export async function notifyError(error, title = 'No se pudo completar la operación') {
  const details = error?.details?.length
    ? `<ul style="text-align:left;margin:.75rem 0 0;padding-left:1.25rem;list-style:disc">${error.details
        .map((d) => `<li>${escapeHtml(d)}</li>`)
        .join('')}</ul>`
    : '';

  await Alert.fire({
    icon: 'error',
    title,
    html: `<p>${escapeHtml(error?.message || 'Error inesperado')}</p>${details}`,
    confirmButtonText: 'Entendido'
  });
}

export const notifySuccess = (title) =>
  Alert.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    title,
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false
  });

export async function confirmAction({ title, text, confirmButtonText = 'Confirmar' }) {
  const { isConfirmed } = await Alert.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    focusCancel: true
  });
  return isConfirmed;
}

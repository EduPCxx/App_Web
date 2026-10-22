// Error normalizado: el resto de la app nunca ve errores crudos de Axios.
// type: 'http' | 'validation' | 'network' | 'timeout' | 'unknown'
export default class ApiError extends Error {
  constructor(message, { status = 0, code = null, type = 'unknown', details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.type = type;
    this.details = details;
  }
}

// Convierte cualquier error (Axios u otro) en ApiError. Es idempotente.
// Formato de la API: { success: false, error: { code, message, details: [{ field, message }] } }
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    const { status, data } = error.response;
    const body = data?.error ?? {};
    const details = Array.isArray(body.details) ? body.details.map((d) => d?.message).filter(Boolean) : [];
    return new ApiError(body.message || `Error ${status} del servidor`, {
      status,
      code: body.code ?? null,
      type: details.length ? 'validation' : 'http',
      details
    });
  }

  if (error?.code === 'ECONNABORTED') {
    return new ApiError('La API tardó demasiado en responder. Inténtalo de nuevo.', { type: 'timeout' });
  }

  if (error?.request) {
    return new ApiError('No se pudo conectar con la API. Revisa que el backend esté en marcha.', { type: 'network' });
  }

  return new ApiError(error?.message || 'Error inesperado', { type: 'unknown' });
}

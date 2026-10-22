const DEFAULT_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  500: 'INTERNAL_ERROR'
};

// Uso: throw new AppError('Producto no encontrado', 404, 'NOT_FOUND')
// details es opcional: lista [{ field, message }] para errores de validación.
class AppError extends Error {
  constructor(message, statusCode = 500, code = DEFAULT_CODES[statusCode] || 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

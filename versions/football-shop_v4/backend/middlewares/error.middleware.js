const { ZodError } = require('zod');
const AppError = require('../utils/AppError');
const { buildValidationErrorBody } = require('../utils/zodError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

// Traduce errores de Mongoose / Mongo / body-parser a AppError (se conserva del errorHandler anterior:
// sin esto, un duplicado o un JSON mal formado acabarían como 500).
const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError('Datos de entrada no válidos', 400, 'VALIDATION_ERROR', details);
  }

  if (err.name === 'CastError') {
    return new AppError(`Valor inválido para "${err.path}": ${err.value}`, 400, 'INVALID_VALUE');
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return new AppError(`Ya existe un registro con el mismo valor en: ${fields}`, 409, 'DUPLICATE_KEY');
  }

  if (err.type === 'entity.parse.failed') {
    return new AppError('JSON mal formado en el cuerpo de la petición', 400, 'INVALID_JSON');
  }

  return err;
};

const logError = (err, statusCode) => {
  if (process.env.NODE_ENV === 'test') return;
  if (statusCode >= 500) {
    console.error('💥 Error no controlado:', err.stack || err);
    if (err.cause) console.error('   Causa:', err.cause.stack || err.cause);
  } else {
    console.error(`⚠️  ${err.code || err.name}: ${err.message}`);
  }
};

// Debe declarar los 4 parámetros para que Express lo reconozca como manejador de errores
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json(buildValidationErrorBody(err));
  }

  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logError(err, statusCode);

  const body = {
    success: false,
    error: {
      code: error instanceof AppError ? error.code : isServerError ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      // En producción nunca se exponen mensajes internos de errores 5xx
      message: isServerError && isProduction ? 'Error interno del servidor' : error.message
    }
  };
  if (error.details) body.error.details = error.details;
  if (isServerError && !isProduction) body.error.stack = err.stack;

  return res.status(statusCode).json(body);
};

module.exports = { notFoundHandler, errorHandler };

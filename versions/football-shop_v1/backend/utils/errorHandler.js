const AppError = require('./AppError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

// Normaliza errores de Mongoose / Mongo / JSON a AppError
const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError('Error de validación', 400, errors);
  }

  if (err.name === 'CastError') {
    return new AppError(`Valor inválido para "${err.path}": ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return new AppError(`Ya existe un registro con el mismo valor en: ${fields}`, 409);
  }

  if (err.type === 'entity.parse.failed') {
    return new AppError('JSON mal formado en el cuerpo de la petición', 400);
  }

  return err;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) console.error('💥 Error no controlado:', err);

  const body = {
    success: false,
    message: isServerError && process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : error.message
  };
  if (error.errors) body.errors = error.errors;
  if (isServerError && process.env.NODE_ENV !== 'production') body.stack = err.stack;

  res.status(statusCode).json(body);
};

module.exports = { notFoundHandler, errorHandler };

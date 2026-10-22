const AppError = require('./AppError');

// Errores que el error.middleware ya sabe traducir (validación, cast, duplicados): se relanzan tal cual.
const isKnownDbError = (error) =>
  error instanceof AppError || ['ValidationError', 'CastError'].includes(error.name) || error.code === 11000;

// Para los catch de los repositories: aporta contexto a los fallos inesperados de la BD sin silenciarlos.
// El error original queda en `cause` para el log (en producción no se envía al cliente).
const wrapDbError = (error, action) => {
  if (isKnownDbError(error)) return error;
  const wrapped = new AppError(`Error de base de datos al ${action}`, 500, 'DATABASE_ERROR');
  wrapped.cause = error;
  return wrapped;
};

module.exports = wrapDbError;

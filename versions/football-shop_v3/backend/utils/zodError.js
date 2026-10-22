// Convierte un ZodError al cuerpo de respuesta 400 estándar.
// Compartido por validate.middleware y error.middleware para no duplicar el formato.
const formatZodIssues = (zodError) =>
  zodError.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));

const buildValidationErrorBody = (zodError) => ({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Datos de entrada no válidos',
    details: formatZodIssues(zodError)
  }
});

module.exports = { formatZodIssues, buildValidationErrorBody };

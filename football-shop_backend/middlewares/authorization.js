const AppError = require('../utils/AppError');

const authorize = (allowedRoles = []) => (req, res, next) => {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

  if (!req.user || !allowedRoles.some((role) => roles.includes(role))) {
    return next(new AppError('No tienes permisos para acceder a este recurso', 403, 'FORBIDDEN'));
  }

  return next();
};

module.exports = authorize;

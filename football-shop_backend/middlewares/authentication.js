const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      throw new AppError('Token no proporcionado', 401, 'UNAUTHORIZED');
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      throw new AppError('Token inválido', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(payload.userId).populate('role_id');
    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError('Usuario no válido o inactivo', 401, 'UNAUTHORIZED');
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      roles: user.role_id ? [user.role_id.name] : []
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;

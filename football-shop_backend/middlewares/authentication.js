const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const authRepository = require('../repositories/auth.repository');

const revokedJtiCache = new Map();
const CACHE_TTL_MS = 60_000;

const getCachedRevocation = (jti) => {
  const cached = revokedJtiCache.get(jti);
  if (!cached) return false;

  if (Date.now() > cached.expiresAt) {
    revokedJtiCache.delete(jti);
    return false;
  }

  return true;
};

const setCachedRevocation = (jti) => {
  if (!jti) return;
  revokedJtiCache.set(jti, { expiresAt: Date.now() + CACHE_TTL_MS });
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      throw new AppError('Token no proporcionado', 401, 'UNAUTHORIZED');
    }

    const payload = verifyToken(token);
    const jti = payload?.jti || token;

    if (getCachedRevocation(jti) || (await authRepository.isTokenRevoked(jti))) {
      setCachedRevocation(jti);
      throw new AppError('El token ha sido revocado', 401, 'TOKEN_REVOKED');
    }

    req.token = token;
    req.tokenPayload = payload;

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

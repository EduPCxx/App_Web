const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const { verifyPassword } = require('../utils/passwd');
const authRepository = require('../repositories/auth.repository');

const sanitizeUser = (user) => {
  if (!user) return null;
  const payload = user.toObject ? user.toObject() : { ...user };
  delete payload.password_hash;
  if (payload.role_id && typeof payload.role_id === 'object') {
    payload.role = payload.role_id.name || null;
    payload.role_id = payload.role_id._id || payload.role_id;
  }
  return payload;
};

const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);

  if (!user || user.deletedAt || !user.isActive) {
    throw new AppError('Credenciales inválidas', 401, 'UNAUTHORIZED');
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    throw new AppError('Credenciales inválidas', 401, 'UNAUTHORIZED');
  }

  const roles = user.role_id ? [user.role_id.name] : [];
  const token = signToken({ userId: String(user._id), email: user.email, roles });
  await authRepository.updateLastLogin(user._id);

  return {
    token,
    user: sanitizeUser(user)
  };
};

module.exports = { login };

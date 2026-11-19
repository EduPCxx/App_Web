const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const getSecret = () => {
  if (!process.env.SECRET) {
    throw new Error('La variable de entorno SECRET no está definida');
  }
  return process.env.SECRET;
};

const signToken = (payload) => {
  const tokenPayload = {
    ...payload,
    jti: payload?.jti || randomUUID()
  };

  return jwt.sign(tokenPayload, getSecret(), {
    expiresIn: process.env.EXPIRES_IN || '1h'
  });
};

const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, getSecret());
    if (!payload || !payload.userId) {
      throw new AppError('Token inválido o expirado', 401, 'UNAUTHORIZED');
    }
    return { ...payload, jti: payload.jti || null };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.message === 'La variable de entorno SECRET no está definida') throw error;
    throw new AppError('Token inválido o expirado', 401, 'UNAUTHORIZED');
  }
};

module.exports = { signToken, verifyToken };

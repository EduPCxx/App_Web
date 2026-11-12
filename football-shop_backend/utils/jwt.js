const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const getSecret = () => {
  if (!process.env.SECRET) {
    throw new Error('La variable de entorno SECRET no está definida');
  }
  return process.env.SECRET;
};

const signToken = (payload) =>
  jwt.sign(payload, getSecret(), { expiresIn: process.env.EXPIRES_IN });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    if (error.message === 'La variable de entorno SECRET no está definida') throw error;
    throw new AppError('Token inválido o expirado', 401, 'UNAUTHORIZED');
  }
};

module.exports = { signToken, verifyToken };

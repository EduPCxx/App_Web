const argon2 = require('argon2');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const hashPassword = async (plainPassword) => {
  if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
    throw new Error('La contraseña es obligatoria');
  }

  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: parsePositiveInt(process.env.ARGON2_MEMORY_COST, 65536),
    timeCost: parsePositiveInt(process.env.ARGON2_TIME_COST, 3),
    parallelism: parsePositiveInt(process.env.ARGON2_PARALLELISM, 1)
  });
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  if (!hashedPassword) return false;

  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (error) {
    return false;
  }
};

module.exports = { hashPassword, verifyPassword };

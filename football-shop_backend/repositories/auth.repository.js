const User = require('../models/user.model');
const RevokedToken = require('../models/revoked-token.model');

const findByEmail = async (email) =>
  User.findOne({ email: String(email).trim().toLowerCase() }).select('+password_hash').populate('role_id');

const findById = async (id) => User.findById(id).populate('role_id');

const updateLastLogin = async (id) =>
  User.findByIdAndUpdate(id, { last_login_at: new Date() }, { new: true }).populate('role_id');

const revokeToken = async ({ token, userId, expiresAt, reason = 'logout' }) => {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken || !userId) {
    return null;
  }

  return RevokedToken.findOneAndUpdate(
    { token: normalizedToken },
    {
      token: normalizedToken,
      user: userId,
      revokedAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + 60 * 60 * 1000),
      reason
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const isTokenRevoked = async (tokenOrJti) => {
  const value = String(tokenOrJti || '').trim();
  if (!value) return false;
  return Boolean(await RevokedToken.exists({ token: value }));
};

const purgeExpiredTokens = async () => {
  const now = new Date();
  return RevokedToken.deleteMany({ expiresAt: { $lt: now } });
};

module.exports = { findByEmail, findById, updateLastLogin, revokeToken, isTokenRevoked, purgeExpiredTokens };

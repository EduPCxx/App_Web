const Profile = require('../models/profile.model');

const findByUserId = async (userId) =>
  Profile.findOne({ user: userId }).populate('user', 'name email role_id').lean();

const upsertByUserId = async (userId, payload = {}) =>
  Profile.findOneAndUpdate(
    { user: userId },
    { $set: { user: userId, ...payload } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .populate('user', 'name email role_id')
    .lean();

module.exports = { findByUserId, upsertByUserId };

const User = require('../models/user.model');

const findByEmail = async (email) =>
  User.findOne({ email: String(email).trim().toLowerCase() }).populate('role_id');

const findById = async (id) => User.findById(id).populate('role_id');

const updateLastLogin = async (id) =>
  User.findByIdAndUpdate(id, { last_login_at: new Date() }, { new: true }).populate('role_id');

module.exports = { findByEmail, findById, updateLastLogin };

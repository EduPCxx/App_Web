const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: require('../utils/lifecycle').STATUSES, default: 'pending', index: true },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

schema.virtual('users', { ref: 'User', localField: '_id', foreignField: 'role_id' });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Role', schema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    revokedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    reason: {
      type: String,
      default: 'logout',
      trim: true,
      index: true
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('RevokedToken', schema);

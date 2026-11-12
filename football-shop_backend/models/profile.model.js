const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
      unique: true,
      index: true
    },
    full_name: { type: String, trim: true, maxlength: 150, default: '' },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    avatar_url: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    address: { type: String, trim: true, maxlength: 250, default: '' },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Profile', schema);

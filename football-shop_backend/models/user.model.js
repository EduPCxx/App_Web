const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'El rol es obligatorio'],
      index: true
    },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo electrónico no es válido']
    },
    password_hash: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true, index: true },
    email_verified_at: { type: Date, default: null },
    last_login_at: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false, toJSON: { transform: (_doc, ret) => { delete ret.password_hash; return ret; } } }
);

module.exports = mongoose.model('User', schema);

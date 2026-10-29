const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

schema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand_id',
  match: { deletedAt: null }
});
schema.virtual('images', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'entity_id',
  match: { entity_type: 'brand' }
});
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Brand', schema);

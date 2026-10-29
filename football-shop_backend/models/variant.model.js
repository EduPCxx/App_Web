const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio'],
      index: true
    },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    sku: { type: String, required: true, trim: true, uppercase: true, unique: true },
    price: { type: mongoose.Schema.Types.Decimal128, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, validate: Number.isInteger, default: 0 },
    compare_at_price: { type: mongoose.Schema.Types.Decimal128, min: 0, default: null },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    is_default: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

schema.virtual('images', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'entity_id',
  match: { entity_type: 'variant' }
});
schema.index(
  { product_id: 1, is_default: 1 },
  { unique: true, partialFilterExpression: { is_default: true } }
);
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Variant', schema);

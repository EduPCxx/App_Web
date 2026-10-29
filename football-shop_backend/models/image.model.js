const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    entity_type: { type: String, enum: ['product', 'variant', 'brand', 'category'], required: true },
    entity_model: {
      type: String,
      enum: ['Product', 'Variant', 'Brand', 'Category'],
      required: true,
      select: false
    },
    entity_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'entity_model', required: true, index: true },
    url: { type: String, required: true, trim: true },
    alt_text: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    sort_order: { type: Number, min: 0, validate: Number.isInteger, default: 0 },
    is_primary: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

schema.pre('find', function () { this.select('+entity_model'); });
schema.pre('findOne', function () { this.select('+entity_model'); });
schema.pre('findOneAndUpdate', function () { this.select('+entity_model'); });
schema.index(
  { entity_type: 1, entity_id: 1, is_primary: 1 },
  { unique: true, partialFilterExpression: { is_primary: true } }
);

module.exports = mongoose.model('Image', schema);

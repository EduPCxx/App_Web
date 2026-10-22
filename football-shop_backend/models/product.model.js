const mongoose = require('mongoose');

const CATEGORIES = ['Camisetas', 'Botas', 'Balones', 'Equipamiento', 'Accesorios'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [150, 'El nombre no puede superar los 150 caracteres']
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: { values: CATEGORIES, message: `La categoría debe ser una de: ${CATEGORIES.join(', ')}` },
      index: true
    },
    team: {
      type: String,
      required: [true, 'El equipo es obligatorio (usa "N/A" si no aplica)'],
      trim: true,
      default: 'N/A',
      index: true
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      validate: { validator: Number.isInteger, message: 'El stock debe ser un número entero' }
    },
    brand: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
      index: true
    },
    size: {
      type: String,
      required: [true, 'La talla/tamaño es obligatoria'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'La descripción no puede superar los 1000 caracteres']
    },
    // Se genera a partir de `name` (ver product.service). Único, también frente a borrados lógicos.
    slug: {
      type: String,
      required: [true, 'El slug es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'suspended'],
      default: 'draft'
    },
    // Visible/no visible (independiente del borrado lógico)
    isActive: { type: Boolean, default: true, index: true },
    // null = activo; con fecha = borrado lógicamente
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
module.exports.CATEGORIES = CATEGORIES;

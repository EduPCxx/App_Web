// Convierte productos del esquema anterior a referencias de categoría/marca y variantes.
// Ejecutar antes de desplegar la versión relacional: npm run migrate:catalog
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('autoIndex', false);

const connectDB = require('../config/db');
const { generateSlug } = require('../utils/slugify');

const migrate = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const products = db.collection('products');
  const categories = db.collection('categories');
  const brands = db.collection('brands');
  const variants = db.collection('variants');
  let migrated = 0;

  const cursor = products.find({
    category_id: { $exists: false },
    brand_id: { $exists: false }
  });
  for await (const product of cursor) {
    const categoryName = product.category || 'Sin categoría';
    const brandName = product.brand || 'Sin marca';
    const categorySlug = generateSlug(categoryName);
    const brandSlug = generateSlug(brandName);

    await categories.updateOne(
      { slug: categorySlug },
      {
        $setOnInsert: {
          name: categoryName,
          slug: categorySlug,
          description: '',
          status: 'active',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    await brands.updateOne(
      { slug: brandSlug },
      {
        $setOnInsert: {
          name: brandName,
          slug: brandSlug,
          status: 'active',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    const category = await categories.findOne({ slug: categorySlug });
    const brand = await brands.findOne({ slug: brandSlug });
    const sku = `LEGACY-${product._id.toString()}`.toUpperCase();
    const migratedStatus =
      product.status === 'published'
        ? 'active'
        : product.status === 'suspended'
          ? 'archived'
          : ['draft', 'active', 'archived'].includes(product.status)
            ? product.status
            : 'active';

    await variants.updateOne(
      { sku },
      {
        $setOnInsert: {
          product_id: product._id,
          name: `${product.name || 'Producto'} - ${product.size || 'Única'}`,
          sku,
          price: mongoose.Types.Decimal128.fromString(Math.max(0, Number(product.price) || 0).toFixed(2)),
          stock: Math.max(0, Math.trunc(Number(product.stock) || 0)),
          attributes: { size: product.size || 'Única', team: product.team || 'N/A' },
          is_default: true,
          status: migratedStatus,
          isActive: product.isActive !== false,
          createdAt: product.createdAt || new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    await products.updateOne(
      { _id: product._id },
      {
        $set: {
          category_id: category._id,
          brand_id: brand._id,
          status: migratedStatus,
          isActive: product.isActive !== false,
          deletedAt: product.deletedAt || null,
          updatedAt: new Date()
        },
        $unset: { category: '', brand: '', price: '', stock: '', team: '', size: '' }
      }
    );
    migrated += 1;
  }

  console.log(`Migración completada: ${migrated} productos convertidos.`);
};

migrate()
  .catch((error) => {
    console.error('Error en la migración:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

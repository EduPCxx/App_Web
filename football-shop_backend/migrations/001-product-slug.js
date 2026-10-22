// Rellena `slug`, `deletedAt` e `isActive` en productos existentes. Idempotente.
// Ejecutar ANTES de arrancar la versión nueva:  npm run migrate:slug
require('dotenv').config();
const mongoose = require('mongoose');

// Sin autoIndex: el índice único de slug fallaría mientras haya productos sin slug.
mongoose.set('autoIndex', false);

const connectDB = require('../config/db');
const Product = require('../models/product.model');
const { generateUniqueSlug } = require('../utils/slugify');

const migrate = async () => {
  await connectDB();
  const col = Product.collection; // colección nativa: no modifica `updatedAt`

  const deleted = await col.updateMany({ deletedAt: { $exists: false } }, { $set: { deletedAt: null } });
  const active = await col.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });

  const taken = new Set((await col.distinct('slug')).filter(Boolean));
  taken.add('new'); // reservado por el frontend (/products/new)
  const cursor = col
    .find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] })
    .sort({ createdAt: 1, _id: 1 }); // los más antiguos se quedan con el slug sin sufijo

  let slugs = 0;
  for await (const doc of cursor) {
    const slug = await generateUniqueSlug(doc.name || 'producto', (candidate) => taken.has(candidate));
    taken.add(slug);
    await col.updateOne({ _id: doc._id }, { $set: { slug } });
    slugs += 1;
  }

  await Product.createIndexes();
  console.log(`✅ Migración completada: deletedAt=${deleted.modifiedCount}, isActive=${active.modifiedCount}, slugs generados=${slugs}`);
};

migrate()
  .catch((error) => {
    console.error('❌ Error en la migración:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

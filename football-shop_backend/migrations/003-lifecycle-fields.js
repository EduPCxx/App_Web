require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('autoIndex', false);

const connectDB = require('../config/db');
const { generateSlug } = require('../utils/slugify');

const collections = ['products', 'categories', 'brands', 'variants', 'images', 'roles', 'users'];
const slugCollections = ['categories', 'brands'];
const statusMap = {
  draft: 'pending',
  active: 'published',
  archived: 'finished',
  suspended: 'cancelled'
};
const statuses = new Set(['pending', 'processing', 'published', 'finished', 'cancelled']);

const uniqueSlug = (base, taken) => {
  let candidate = base;
  let suffix = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  taken.add(candidate);
  return candidate;
};

const migrate = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  let updated = 0;

  for (const name of collections) {
    const collection = db.collection(name);
    const takenSlugs = slugCollections.includes(name)
      ? new Set((await collection.distinct('slug')).filter(Boolean))
      : null;
    const cursor = collection.find({}, { projection: { _id: 1, name: 1, slug: 1, status: 1, isActive: 1, deletedAt: 1 } });

    for await (const document of cursor) {
      const set = {};
      if (document.isActive === undefined) set.isActive = true;
      if (document.deletedAt === undefined) set.deletedAt = null;
      const normalizedStatus = statusMap[document.status] || document.status;
      const status = statuses.has(normalizedStatus) ? normalizedStatus : 'pending';
      if (document.status !== status) set.status = status;

      if (takenSlugs && !document.slug) {
        const base = generateSlug(document.name || name.slice(0, -1));
        set.slug = uniqueSlug(base, takenSlugs);
      }

      if (Object.keys(set).length) {
        set.updatedAt = new Date();
        await collection.updateOne({ _id: document._id }, { $set: set });
        updated += 1;
      }
    }

    await collection.createIndex({ status: 1 });
    await collection.createIndex({ isActive: 1 });
    await collection.createIndex({ deletedAt: 1 });
    if (slugCollections.includes(name)) await collection.createIndex({ slug: 1 }, { unique: true });
  }

  console.log(`Migración de ciclo de vida completada: ${updated} registros actualizados.`);
};

migrate()
  .catch((error) => {
    console.error('Error en la migración de ciclo de vida:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

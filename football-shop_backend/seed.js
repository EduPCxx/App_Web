require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/category.model');
const Brand = require('./models/brand.model');
const Product = require('./models/product.model');
const Variant = require('./models/variant.model');
const Role = require('./models/role.model');
const User = require('./models/user.model');
const Image = require('./models/image.model');
const { generateSlug } = require('./utils/slugify');
const { hashPassword } = require('./services/catalog.service');

const categories = ['Camisetas', 'Botas', 'Balones', 'Equipamiento', 'Accesorios'];
const brands = ['Nike', 'Adidas', 'Puma'];
const products = [
  { name: 'Camiseta FC Barcelona', category: 'Camisetas', brand: 'Nike', team: 'FC Barcelona', size: 'M', sku: 'FCB-HOME-M', price: 99.95, stock: 30, description: 'Camiseta oficial de local con tejido transpirable.' },
  { name: 'Camiseta Real Madrid', category: 'Camisetas', brand: 'Adidas', team: 'Real Madrid', size: 'L', sku: 'RMA-HOME-L', price: 99.95, stock: 25, description: 'Camiseta oficial de local con tejido transpirable.' },
  { name: 'Camiseta Selección Española', category: 'Camisetas', brand: 'Adidas', team: 'Selección Española', size: 'XL', sku: 'ESP-HOME-XL', price: 109.95, stock: 40, description: 'Camiseta de la selección para aficionados.' },
  { name: 'Botas Mercurial Superfly Elite', category: 'Botas', brand: 'Nike', team: 'N/A', size: '42', sku: 'NK-MERC-42', price: 279.99, stock: 12, description: 'Botas FG para velocidad con suela Air Zoom.' },
  { name: 'Botas Predator Elite FG', category: 'Botas', brand: 'Adidas', team: 'N/A', size: '43', sku: 'AD-PRED-43', price: 259.99, stock: 15, description: 'Botas con zonas de control para mayor precisión.' },
  { name: 'Botas Future Ultimate FG/AG', category: 'Botas', brand: 'Puma', team: 'N/A', size: '41', sku: 'PU-FUT-41', price: 219.99, stock: 20, description: 'Botas de ajuste adaptable para máxima libertad.' },
  { name: 'Balón Oficial LaLiga', category: 'Balones', brand: 'Puma', team: 'N/A', size: '5', sku: 'LALIGA-BALL-5', price: 149.99, stock: 35, description: 'Balón oficial con certificación FIFA Quality Pro.' },
  { name: 'Balón Champions League Pro', category: 'Balones', brand: 'Adidas', team: 'N/A', size: '5', sku: 'UCL-BALL-5', price: 159.99, stock: 22, description: 'Balón de competición inspirado en la UEFA Champions League.' },
  { name: 'Balón de Entrenamiento Club', category: 'Balones', brand: 'Nike', team: 'FC Barcelona', size: '4', sku: 'NK-TRAIN-4', price: 24.99, stock: 60, description: 'Balón resistente para entrenamientos.' },
  { name: 'Espinilleras Protect Pro', category: 'Equipamiento', brand: 'Adidas', team: 'N/A', size: 'M', sku: 'AD-SHIN-M', price: 19.95, stock: 80, description: 'Espinilleras ligeras con protección de espuma EVA.' },
  { name: 'Guantes de Portero Predator Pro', category: 'Equipamiento', brand: 'Adidas', team: 'N/A', size: '9', sku: 'AD-GK-9', price: 64.95, stock: 28, description: 'Guantes con látex de alto agarre.' },
  { name: 'Bufanda Real Madrid', category: 'Accesorios', brand: 'Adidas', team: 'Real Madrid', size: 'Única', sku: 'RMA-SCARF-UNI', price: 17.95, stock: 100, description: 'Bufanda de punto con escudo bordado.' },
  { name: 'Gorra FC Barcelona', category: 'Accesorios', brand: 'Nike', team: 'FC Barcelona', size: 'Única', sku: 'FCB-CAP-UNI', price: 24.95, stock: 70, description: 'Gorra ajustable con escudo bordado.' },
  { name: 'Mochila Selección Española', category: 'Accesorios', brand: 'Adidas', team: 'Selección Española', size: 'Única', sku: 'ESP-BAG-UNI', price: 39.95, stock: 45, description: 'Mochila deportiva con compartimento para botas.' }
];

const seed = async () => {
  try {
    await connectDB();
    const categoryByName = new Map();
    const brandByName = new Map();

    const roleIds = new Map();
    for (const role of [
      { name: 'admin', description: 'Administración de la tienda' },
      { name: 'editor', description: 'Gestión del catálogo' },
      { name: 'customer', description: 'Cliente de la tienda' }
    ]) {
      const savedRole = await Role.findOneAndUpdate(
        { name: role.name },
        { $setOnInsert: { ...role, status: 'pending', isActive: true } },
        { new: true, upsert: true, runValidators: true }
      );
      roleIds.set(role.name, savedRole._id);
    }

    const seededPassword = process.env.SEED_USER_PASSWORD || crypto.randomBytes(32).toString('hex');
    await User.updateOne(
      { email: 'cliente@example.test' },
      {
        $setOnInsert: {
          role_id: roleIds.get('customer'),
          name: 'Cliente de ejemplo',
          email: 'cliente@example.test',
          password_hash: await hashPassword(seededPassword),
          status: 'pending',
          isActive: true
        }
      },
      { upsert: true, runValidators: true }
    );

    for (const name of categories) {
      const category = await Category.findOneAndUpdate(
        { slug: generateSlug(name) },
        { $setOnInsert: { name, slug: generateSlug(name), status: 'pending', isActive: true } },
        { new: true, upsert: true, runValidators: true }
      );
      categoryByName.set(name, category._id);
    }

    for (const name of brands) {
      const brand = await Brand.findOneAndUpdate(
        { slug: generateSlug(name) },
        { $setOnInsert: { name, slug: generateSlug(name), status: 'pending', isActive: true } },
        { new: true, upsert: true, runValidators: true }
      );
      brandByName.set(name, brand._id);
    }

    let inserted = 0;
    let imagesAdded = 0;
    for (const item of products) {
      let product = await Product.findOne({ slug: generateSlug(item.name) });
      if (!product) {
        product = await Product.create({
          name: item.name,
          slug: generateSlug(item.name),
          category_id: categoryByName.get(item.category),
          brand_id: brandByName.get(item.brand),
          description: item.description,
          status: 'pending',
          isActive: true
        });
        inserted += 1;
      }
      await Variant.updateOne(
        { sku: item.sku },
        {
          $setOnInsert: {
            product_id: product._id,
            name: `${item.name} - ${item.size}`,
            sku: item.sku,
            price: mongoose.Types.Decimal128.fromString(item.price.toFixed(2)),
            stock: item.stock,
            attributes: { size: item.size, team: item.team },
            is_default: true,
            status: 'pending',
            isActive: true
          }
        },
        { upsert: true, runValidators: true }
      );
      const imageExists = await Image.exists({ entity_type: 'product', entity_id: product._id });
      if (!imageExists) {
        await Image.create({
          entity_type: 'product',
          entity_model: 'Product',
          entity_id: product._id,
          url: `https://placehold.co/800x1000?text=${encodeURIComponent(item.name)}`,
          alt_text: item.name,
          title: item.name,
          sort_order: 0,
          is_primary: true,
          status: 'pending',
          isActive: true
        });
        imagesAdded += 1;
      }
    }

    console.log(
      `Seed completado: ${categories.length} categorías, ${brands.length} marcas, ${inserted} productos nuevos, ${imagesAdded} imágenes nuevas; variantes, roles y usuario de ejemplo verificados.`
    );
  } catch (error) {
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();

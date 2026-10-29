require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/category.model');
const Brand = require('./models/brand.model');
const Product = require('./models/product.model');
const Variant = require('./models/variant.model');
const Role = require('./models/role.model');
const { generateSlug } = require('./utils/slugify');

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

    for (const name of categories) {
      const category = await Category.findOneAndUpdate(
        { slug: generateSlug(name) },
        { $setOnInsert: { name, slug: generateSlug(name), status: 'active', isActive: true } },
        { new: true, upsert: true, runValidators: true }
      );
      categoryByName.set(name, category._id);
    }

    for (const name of brands) {
      const brand = await Brand.findOneAndUpdate(
        { slug: generateSlug(name) },
        { $setOnInsert: { name, slug: generateSlug(name), status: 'active', isActive: true } },
        { new: true, upsert: true, runValidators: true }
      );
      brandByName.set(name, brand._id);
    }

    for (const role of [
      { name: 'admin', description: 'Administración de la tienda' },
      { name: 'editor', description: 'Gestión del catálogo' },
      { name: 'customer', description: 'Cliente de la tienda' }
    ]) {
      await Role.updateOne({ name: role.name }, { $setOnInsert: role }, { upsert: true, runValidators: true });
    }

    let inserted = 0;
    for (const item of products) {
      let product = await Product.findOne({ slug: generateSlug(item.name) });
      if (!product) {
        product = await Product.create({
          name: item.name,
          slug: generateSlug(item.name),
          category_id: categoryByName.get(item.category),
          brand_id: brandByName.get(item.brand),
          description: item.description,
          status: 'active',
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
            status: 'active',
            isActive: true
          }
        },
        { upsert: true, runValidators: true }
      );
    }

    console.log(`Seed completado: ${categories.length} categorías, ${brands.length} marcas y ${inserted} productos nuevos; variantes y roles verificadas.`);
  } catch (error) {
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();

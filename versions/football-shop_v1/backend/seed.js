require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/product.model');

const products = [
  { name: 'Camiseta Oficial 1ª Equipación', category: 'Camisetas', team: 'FC Barcelona', price: 99.95, stock: 30, brand: 'Nike', size: 'M', description: 'Camiseta oficial de local, tejido Dri-FIT y escudo termosellado.' },
  { name: 'Camiseta Oficial 1ª Equipación', category: 'Camisetas', team: 'Real Madrid', price: 99.95, stock: 25, brand: 'Adidas', size: 'L', description: 'Camiseta blanca de local con tecnología AEROREADY.' },
  { name: 'Camiseta Oficial 2ª Equipación', category: 'Camisetas', team: 'Real Madrid', price: 94.95, stock: 18, brand: 'Adidas', size: 'S', description: 'Segunda equipación con diseño exclusivo y cuello en V.' },
  { name: 'Camiseta Selección Española 1ª Equipación', category: 'Camisetas', team: 'Selección Española', price: 109.95, stock: 40, brand: 'Adidas', size: 'XL', description: 'Camiseta roja de la selección, versión réplica para aficionado.' },
  { name: 'Botas Mercurial Superfly Elite', category: 'Botas', team: 'N/A', price: 279.99, stock: 12, brand: 'Nike', size: '42', description: 'Botas de tacos FG para velocidad, con suela Air Zoom.' },
  { name: 'Botas Predator Elite FG', category: 'Botas', team: 'N/A', price: 259.99, stock: 15, brand: 'Adidas', size: '43', description: 'Botas con zonas de control en el empeine para mayor precisión.' },
  { name: 'Botas Future Ultimate FG/AG', category: 'Botas', team: 'N/A', price: 219.99, stock: 20, brand: 'Puma', size: '41', description: 'Botas con ajuste adaptable FUZIONFIT+ para máxima libertad de movimiento.' },
  { name: 'Balón Oficial LaLiga Accelerate', category: 'Balones', team: 'N/A', price: 149.99, stock: 35, brand: 'Puma', size: 'Talla 5', description: 'Balón oficial de partido con tecnología FIFA Quality Pro.' },
  { name: 'Balón Champions League Pro', category: 'Balones', team: 'N/A', price: 159.99, stock: 22, brand: 'Adidas', size: 'Talla 5', description: 'Réplica del balón oficial de la UEFA Champions League.' },
  { name: 'Balón de Entrenamiento Club', category: 'Balones', team: 'FC Barcelona', price: 24.99, stock: 60, brand: 'Nike', size: 'Talla 4', description: 'Balón de entrenamiento resistente para césped natural y artificial.' },
  { name: 'Espinilleras Protect Pro', category: 'Equipamiento', team: 'N/A', price: 19.95, stock: 80, brand: 'Adidas', size: 'M', description: 'Espinilleras ligeras con protección de espuma EVA.' },
  { name: 'Guantes de Portero Predator Pro', category: 'Equipamiento', team: 'N/A', price: 64.95, stock: 28, brand: 'Adidas', size: '9', description: 'Guantes de portero con látex de alto agarre y corte negativo.' },
  { name: 'Bufanda Oficial Real Madrid', category: 'Accesorios', team: 'Real Madrid', price: 17.95, stock: 100, brand: 'Adidas', size: 'Única', description: 'Bufanda de punto jacquard con escudo bordado.' },
  { name: 'Gorra Oficial FC Barcelona', category: 'Accesorios', team: 'FC Barcelona', price: 24.95, stock: 70, brand: 'Nike', size: 'Única', description: 'Gorra ajustable con escudo bordado del club.' },
  { name: 'Mochila Deportiva Selección Española', category: 'Accesorios', team: 'Selección Española', price: 39.95, stock: 45, brand: 'Adidas', size: 'Única', description: 'Mochila con compartimento para botas y bolsillo con cremallera.' }
];

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`🌱 Seed completado: ${inserted.length} productos insertados`);
  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();

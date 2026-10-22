const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('La variable de entorno MONGODB_URI no está definida');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`✅ MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

module.exports = connectDB;

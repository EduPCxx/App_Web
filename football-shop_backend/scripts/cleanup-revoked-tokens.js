require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const RevokedToken = require('../models/revoked-token.model');

(async () => {
  try {
    await connectDB();
    const result = await RevokedToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`🧹 Tokens revocados expirados eliminados: ${result.deletedCount}`);
  } catch (error) {
    console.error('❌ No se pudo limpiar los tokens revocados:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();

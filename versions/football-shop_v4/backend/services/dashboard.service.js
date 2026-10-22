const productRepository = require('../repositories/product.repository');

const round2 = (value) => Math.round((value || 0) * 100) / 100;

// Convierte la agregación (facet) en un objeto plano y estable para el frontend
const getStats = async () => {
  try {
    const raw = await productRepository.getStatsRaw();
    const totals = (raw && raw.totals && raw.totals[0]) || {};
    const total = totals.total || 0;
    const active = totals.active || 0;

    return {
      total,
      active,
      inactive: total - active,
      outOfStock: totals.outOfStock || 0,
      units: totals.units || 0,
      inventoryValue: round2(totals.inventoryValue),
      byCategory: ((raw && raw.byCategory) || []).map((item) => ({ category: item._id, count: item.count }))
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { getStats };

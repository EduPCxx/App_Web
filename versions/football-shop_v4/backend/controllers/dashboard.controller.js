const dashboardService = require('../services/dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };

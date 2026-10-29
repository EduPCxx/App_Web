const catalogService = require('../services/catalog.service');

const controllerFor = (type) => ({
  create: async (req, res, next) => {
    try {
      const data = await catalogService.create(type, req.body);
      res.status(201).json({ success: true, message: `${type} creado correctamente`, data });
    } catch (error) {
      next(error);
    }
  },
  list: async (_req, res, next) => {
    try {
      const data = await catalogService.list(type);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const data = await catalogService.getById(type, req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await catalogService.update(type, req.params.id, req.body);
      res.status(200).json({ success: true, message: `${type} actualizado correctamente`, data });
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      const data = await catalogService.remove(type, req.params.id);
      res.status(200).json({ success: true, message: `${type} eliminado correctamente`, data });
    } catch (error) {
      next(error);
    }
  }
});

module.exports = controllerFor;

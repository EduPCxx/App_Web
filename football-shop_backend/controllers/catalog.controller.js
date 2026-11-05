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
  list: async (req, res, next) => {
    try {
      const { items, pagination } = await catalogService.list(type, req.query);
      res.status(200).json({ success: true, data: items, pagination });
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
  getBySlug: async (req, res, next) => {
    try {
      const data = await catalogService.getBySlug(type, req.params.slug);
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
  },
  softDelete: async (req, res, next) => {
    try {
      const data = await catalogService.softDelete(type, req.params.id);
      res.status(200).json({ success: true, message: `${type} eliminado correctamente`, data });
    } catch (error) {
      next(error);
    }
  },
  restore: async (req, res, next) => {
    try {
      const data = await catalogService.restore(type, req.params.id);
      res.status(200).json({ success: true, message: `${type} restaurado correctamente`, data });
    } catch (error) {
      next(error);
    }
  },
  setActive: async (req, res, next) => {
    try {
      const data = await catalogService.setActive(type, req.params.id, req.body.isActive);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  setStatus: async (req, res, next) => {
    try {
      const data = await catalogService.setStatus(type, req.params.id, req.body.status);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
});

module.exports = controllerFor;

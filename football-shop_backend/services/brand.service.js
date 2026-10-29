const catalogService = require('./catalog.service');

module.exports = {
  list: (options) => catalogService.list('brands', options),
  getById: (id) => catalogService.getById('brands', id),
  create: (data) => catalogService.create('brands', data),
  update: (id, data) => catalogService.update('brands', id, data),
  remove: (id) => catalogService.remove('brands', id)
};

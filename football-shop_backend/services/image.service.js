const catalogService = require('./catalog.service');

module.exports = {
  list: (options) => catalogService.list('images', options),
  getById: (id) => catalogService.getById('images', id),
  create: (data) => catalogService.create('images', data),
  update: (id, data) => catalogService.update('images', id, data),
  remove: (id) => catalogService.remove('images', id)
};

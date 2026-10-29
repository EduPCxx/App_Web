const catalogService = require('./catalog.service');

module.exports = {
  list: (options) => catalogService.list('categories', options),
  getById: (id) => catalogService.getById('categories', id),
  create: (data) => catalogService.create('categories', data),
  update: (id, data) => catalogService.update('categories', id, data),
  remove: (id) => catalogService.remove('categories', id)
};

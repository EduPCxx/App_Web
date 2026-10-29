const catalogService = require('./catalog.service');

module.exports = {
  list: (options) => catalogService.list('variants', options),
  getById: (id) => catalogService.getById('variants', id),
  create: (data) => catalogService.create('variants', data),
  update: (id, data) => catalogService.update('variants', id, data),
  remove: (id) => catalogService.remove('variants', id)
};

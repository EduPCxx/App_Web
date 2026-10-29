const catalogService = require('./catalog.service');

module.exports = {
  list: (options) => catalogService.list('roles', options),
  getById: (id) => catalogService.getById('roles', id),
  create: (data) => catalogService.create('roles', data),
  update: (id, data) => catalogService.update('roles', id, data),
  remove: (id) => catalogService.remove('roles', id)
};

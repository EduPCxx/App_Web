const catalogService = require('./catalog.service');

module.exports = {
  list: (options) => catalogService.list('users', options),
  getById: (id) => catalogService.getById('users', id),
  create: (data) => catalogService.create('users', data),
  update: (id, data) => catalogService.update('users', id, data),
  remove: (id) => catalogService.remove('users', id)
};

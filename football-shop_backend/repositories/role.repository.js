const catalogRepository = require('./catalog.repository');

const type = 'roles';

module.exports = {
  findAll: (options) => catalogRepository.findAll(type, options),
  findById: (id) => catalogRepository.findById(type, id),
  create: (data) => catalogRepository.create(type, data),
  updateById: (id, data) => catalogRepository.updateById(type, id, data),
  deleteById: (id) => catalogRepository.deleteById(type, id),
  exists: (id) => catalogRepository.exists(type, id),
  existsBySlug: (slug, excludeId) => catalogRepository.existsBySlug(type, slug, excludeId),
  hasReferences: (id) => catalogRepository.hasReferences(type, id),
  findDuplicateFlag: (filter, excludeId) => catalogRepository.findDuplicateFlag(type, filter, excludeId)
};

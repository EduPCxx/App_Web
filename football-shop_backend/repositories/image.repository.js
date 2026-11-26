const catalogRepository = require('./catalog.repository');
const Image = require('../models/image.model');
const wrapDbError = require('../utils/wrapDbError');

const type = 'images';

module.exports = {
  findAll: (options) => catalogRepository.findAll(type, options),
  findById: (id) => catalogRepository.findById(type, id),
  create: (data) => catalogRepository.create(type, data),
  updateById: (id, data) => catalogRepository.updateById(type, id, data),
  deleteById: (id) => catalogRepository.deleteById(type, id),
  exists: (id) => catalogRepository.exists(type, id),
  existsBySlug: (slug, excludeId) => catalogRepository.existsBySlug(type, slug, excludeId),
  hasReferences: (id) => catalogRepository.hasReferences(type, id),
  findDuplicateFlag: (filter, excludeId) => catalogRepository.findDuplicateFlag(type, filter, excludeId),
  unsetOtherPrimary: async (entityType, entityId, excludeId) => {
    try {
      await Image.updateMany(
        { entity_type: entityType, entity_id: entityId, is_primary: true, _id: { $ne: excludeId } },
        { $set: { is_primary: false } }
      );
    } catch (error) {
      throw wrapDbError(error, 'actualizar la imagen principal');
    }
  }
};

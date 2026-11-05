import { catalogRepository } from '@/repositories/catalogRepository';

const unwrapData = (response) => response.data;

export const createCatalogService = (resource) => ({
  list: async () => unwrapData(await catalogRepository.list(resource)),
  getById: async (id) => unwrapData(await catalogRepository.getById(resource, id)),
  create: async (payload) => unwrapData(await catalogRepository.create(resource, payload)),
  update: async (id, payload) => unwrapData(await catalogRepository.update(resource, id, payload)),
  remove: async (id) => unwrapData(await catalogRepository.remove(resource, id))
});

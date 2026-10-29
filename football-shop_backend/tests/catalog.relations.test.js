const assert = require('assert');
const Module = require('module');
const path = require('path');

const records = {
  products: new Map([['product-1', { _id: 'product-1' }]]),
  variants: new Map(),
  categories: new Map([['category-1', { _id: 'category-1' }]]),
  brands: new Map([['brand-1', { _id: 'brand-1' }]]),
  images: new Map([['image-1', { _id: 'image-1', entity_type: 'product', entity_id: 'product-1' }]]),
  roles: new Map([['role-1', { _id: 'role-1' }]]),
  users: new Map()
};
let nextId = 0;
const fakeRepository = {
  exists: async (type, id) => records[type].has(String(id)),
  existsBySlug: async () => false,
  findAll: async (type) => Array.from(records[type].values()),
  findById: async (type, id) => records[type].get(String(id)) || null,
  create: async (type, data) => {
    const record = { _id: `new-${++nextId}`, ...data };
    records[type].set(record._id, record);
    return record;
  },
  updateById: async (type, id, data) => {
    const record = records[type].get(String(id));
    if (!record) return null;
    Object.assign(record, data);
    return record;
  },
  deleteById: async (type, id) => records[type].get(String(id)),
  hasReferences: async () => false,
  findDuplicateFlag: async (type, filter, excludeId) =>
    Array.from(records[type].values()).some((row) =>
      row._id !== excludeId && Object.entries(filter).every(([key, value]) => row[key] === value)
    )
};

const originalLoad = Module._load;
const repositoryTypes = {
  '../repositories/category.repository': 'categories',
  '../repositories/brand.repository': 'brands',
  '../repositories/variant.repository': 'variants',
  '../repositories/image.repository': 'images',
  '../repositories/role.repository': 'roles',
  '../repositories/user.repository': 'users'
};
Module._load = function (request, ...rest) {
  if (request === '../repositories/catalog.repository') return fakeRepository;
  if (repositoryTypes[request]) {
    const type = repositoryTypes[request];
    return {
      findAll: (options) => fakeRepository.findAll(type, options),
      findById: (id) => fakeRepository.findById(type, id),
      create: (data) => fakeRepository.create(type, data),
      updateById: (id, data) => fakeRepository.updateById(type, id, data),
      deleteById: (id) => fakeRepository.deleteById(type, id),
      exists: (id) => fakeRepository.exists(type, id),
      existsBySlug: (slug, excludeId) => fakeRepository.existsBySlug(type, slug, excludeId),
      hasReferences: (id) => fakeRepository.hasReferences(type, id),
      findDuplicateFlag: (filter, excludeId) => fakeRepository.findDuplicateFlag(type, filter, excludeId)
    };
  }
  if (request === '../utils/slugify') {
    return {
      generateUniqueSlug: async (name) => name.toLowerCase().replace(/\s+/g, '-')
    };
  }
  return originalLoad.call(this, request, ...rest);
};

const service = require(path.join(__dirname, '..', 'services/catalog.service'));
const expectError = async (fn, statusCode, code) => {
  try {
    await fn();
  } catch (error) {
    assert.strictEqual(error.statusCode, statusCode);
    assert.strictEqual(error.code, code);
    return;
  }
  assert.fail(`Se esperaba el error ${code}`);
};

const tests = {
  async rejectsMissingVariantProduct() {
    await expectError(
      () => service.create('variants', { product_id: 'missing', is_default: true }),
      404,
      'RELATED_RESOURCE_NOT_FOUND'
    );
  },
  async rejectsDuplicateDefaultVariant() {
    records.variants.set('variant-1', { _id: 'variant-1', product_id: 'product-1', is_default: true });
    await expectError(
      () => service.create('variants', { product_id: 'product-1', is_default: true }),
      409,
      'RELATED_RESOURCES_EXIST'
    );
    records.variants.delete('variant-1');
  },
  async rejectsComparePriceBelowPrice() {
    await expectError(
      () => service.create('variants', { product_id: 'product-1', price: 10, compare_at_price: 8 }),
      400,
      'VALIDATION_ERROR'
    );
  },
  async associatesImageWithExistingEntity() {
    const image = await service.create('images', {
      entity_type: 'product',
      entity_id: 'product-1',
      url: 'https://example.com/product.jpg'
    });
    assert.strictEqual(image.entity_model, 'Product');
    await expectError(
      () => service.create('images', { entity_type: 'brand', entity_id: 'missing' }),
      404,
      'RELATED_RESOURCE_NOT_FOUND'
    );
  },
  async validatesUpdatedPolymorphicReference() {
    await expectError(
      () => service.update('images', 'image-1', { entity_type: 'category' }),
      404,
      'RELATED_RESOURCE_NOT_FOUND'
    );
  },
  async hashesUserPassword() {
    const user = await service.create('users', {
      role_id: 'role-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'a-secret-password'
    });
    assert.match(user.password_hash, /^scrypt\$[a-f0-9]+\$[a-f0-9]+$/);
    assert.strictEqual(Object.hasOwn(user, 'password'), false);
  }
};

(async () => {
  let failed = 0;
  for (const [name, run] of Object.entries(tests)) {
    try {
      await run();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${name}\n  ${error.stack}`);
    }
  }
  Module._load = originalLoad;
  process.exit(failed ? 1 : 0);
})();

const assert = require('assert');
const schemas = require('../validators/catalog.validator');

const tests = {
  imageUrlMustBeValid() {
    const body = {
      entity_type: 'product',
      entity_id: '66b1f0c2a4d3e5f6a7b8c9d0',
      url: 'https://example.com/image.jpg'
    };
    assert.strictEqual(schemas.images.create.safeParse({ body }).success, true);
    assert.strictEqual(schemas.images.create.safeParse({ body: { ...body, url: 'not-a-url' } }).success, false);
  },
  listPaginationIsParsedAndCapped() {
    const parsed = schemas.categories.list.safeParse({ query: { page: '2', limit: '100' } });
    assert.strictEqual(parsed.success, true);
    assert.deepStrictEqual(parsed.data.query, { page: 2, limit: 100 });
    assert.strictEqual(schemas.categories.list.safeParse({ query: { limit: '101' } }).success, false);
  },
  statusValuesMatchLifecycle() {
    const valid = { name: 'Camisetas', status: 'pending' };
    const invalid = { ...valid, status: 'active' };
    assert.strictEqual(schemas.categories.create.safeParse({ body: valid }).success, true);
    assert.strictEqual(schemas.categories.create.safeParse({ body: invalid }).success, false);
  }
};

for (const [name, run] of Object.entries(tests)) {
  run();
  console.log(`✓ ${name}`);
}

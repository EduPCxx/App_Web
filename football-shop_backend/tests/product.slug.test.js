// Lógica de slug y borrado lógico del servicio, con repositorio en memoria y `slugify` simulado.
// Ejecutar: npm test
const assert = require('assert');
const Module = require('module');
const path = require('path');

let seq = 0;
const db = [];
let failNextCreateWithCollision = false;
let statsRaw = null;
const live = (d) => d.deletedAt === null;
const fakeCatalogRepository = { exists: async () => true };

const fakeRepo = {
  findAll: async () => db.filter(live),
  count: async () => db.filter(live).length,
  findById: async (id) => db.find((d) => d._id === id && live(d)) || null,
  findBySlug: async (slug) => db.find((d) => d.slug === slug && live(d)) || null,
  create: async (data) => {
    if (failNextCreateWithCollision) {
      failNextCreateWithCollision = false;
      throw Object.assign(new Error('dup'), { code: 11000, keyPattern: { slug: 1 } });
    }
    const doc = { _id: String(++seq), deletedAt: null, ...data };
    db.push(doc);
    return doc;
  },
  updateById: async (id, data) => { const d = db.find((x) => x._id === id && live(x)); return d ? Object.assign(d, data) : null; },
  softDeleteBySlug: async (slug) => { const d = db.find((x) => x.slug === slug && live(x)); return d ? Object.assign(d, { deletedAt: new Date() }) : null; },
  setActiveBySlug: async (slug, isActive) => { const d = db.find((x) => x.slug === slug && live(x)); return d ? Object.assign(d, { isActive }) : null; },
  getStatsRaw: async () => statsRaw,
  deleteById: async () => null,
  slugExists: async (slug, ex) => db.some((d) => d.slug === slug && d._id !== ex)
};

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === '../repositories/product.repository') return fakeRepo;
  if (request === '../repositories/catalog.repository') return fakeCatalogRepository;
  if (request === 'slugify') return (t) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return origLoad.call(this, request, ...rest);
};

const svc = require(path.join(__dirname, '..', 'services/product.service'));
const dashboard = require(path.join(__dirname, '..', 'services/dashboard.service'));
const base = {
  name: 'Balon Oficial',
  category_id: 'category-id',
  brand_id: 'brand-id',
  description: 'x'
};
const fails = async (fn, status) => {
  try { await fn(); } catch (e) { assert.strictEqual(e.statusCode, status, e.message); return; }
  assert.fail(`Se esperaba error ${status}`);
};

const tests = {
  async slugAutomaticoConSufijos() {
    const a = await svc.createProduct(base);
    const b = await svc.createProduct(base);
    assert.deepStrictEqual([a.slug, b.slug], ['balon-oficial', 'balon-oficial-2']);
  },
  async slugReservado() {
    assert.strictEqual((await svc.createProduct({ ...base, name: 'New' })).slug, 'new-2');
  },
  async reintentaEnColision() {
    failNextCreateWithCollision = true;
    assert.ok((await svc.createProduct({ ...base, name: 'Reintento' })).slug);
  },
  async renombrarRegeneraSlug() {
    const p = await svc.createProduct({ ...base, name: 'Gorra Club' });
    assert.strictEqual((await svc.updateProductBySlug(p.slug, { price: 5 })).slug, 'gorra-club');
    assert.strictEqual((await svc.updateProductBySlug('gorra-club', { name: 'Gorra Club' })).slug, 'gorra-club');
    const renamed = await svc.updateProductBySlug('gorra-club', { name: 'Gorra Nueva' });
    assert.strictEqual(renamed.slug, 'gorra-nueva');
    await fails(() => svc.getProductBySlug('gorra-club'), 404);
  },
  async renombrarPorIdTambienRegenera() {
    const p = await svc.createProduct({ ...base, name: 'Bufanda Uno' });
    assert.strictEqual((await svc.updateProduct(p._id, { name: 'Bufanda Dos' })).slug, 'bufanda-dos');
  },
  async borradoLogico() {
    const p = await svc.createProduct({ ...base, name: 'Borrable' });
    const del = await svc.softDeleteProductBySlug(p.slug);
    assert.ok(del.deletedAt);
    await fails(() => svc.getProductBySlug(p.slug), 404);
    await fails(() => svc.getProductById(p._id), 404);
    await fails(() => svc.updateProductBySlug(p.slug, { price: 1 }), 404);
    await fails(() => svc.softDeleteProductBySlug(p.slug), 404);
    const { items } = await svc.listProducts({ page: 1, limit: 10 });
    assert.ok(!items.some((i) => i.slug === p.slug));
  },
  async activarYDesactivar() {
    const p = await svc.createProduct({ ...base, name: 'Toggle' });
    assert.strictEqual((await svc.setProductActiveBySlug(p.slug, false)).isActive, false);
    assert.strictEqual((await svc.setProductActiveBySlug(p.slug, false)).isActive, false); // idempotente
    assert.strictEqual((await svc.setProductActiveBySlug(p.slug, true)).isActive, true);
    await fails(() => svc.setProductActiveBySlug('no-existe', true), 404);
    await svc.softDeleteProductBySlug(p.slug);
    await fails(() => svc.setProductActiveBySlug(p.slug, true), 404);
  },
  async estadisticas() {
    statsRaw = {
      totals: [{ total: 10, active: 8, outOfStock: 2, units: 120, inventoryValue: 1234.5678 }],
      byCategory: [{ _id: 'Camisetas', count: 6 }, { _id: 'Botas', count: 4 }]
    };
    assert.deepStrictEqual(await dashboard.getStats(), {
      total: 10, active: 8, inactive: 2, outOfStock: 2, units: 120, inventoryValue: 1234.57,
      byCategory: [{ category: 'Camisetas', count: 6 }, { category: 'Botas', count: 4 }]
    });
    statsRaw = { totals: [], byCategory: [] }; // catálogo vacío
    assert.deepStrictEqual(await dashboard.getStats(), { total: 0, active: 0, inactive: 0, outOfStock: 0, units: 0, inventoryValue: 0, byCategory: [] });
  },
  async slugDeBorradoSigueOcupado() {
    const p = await svc.createProduct({ ...base, name: 'Fantasma' });
    await svc.softDeleteProductBySlug(p.slug);
    assert.strictEqual((await svc.createProduct({ ...base, name: 'Fantasma' })).slug, 'fantasma-2');
  }
};

(async () => {
  let failed = 0;
  for (const [name, fn] of Object.entries(tests)) {
    try { await fn(); console.log(`✓ ${name}`); } catch (e) { failed += 1; console.error(`✗ ${name}\n  ${e.stack}`); }
  }
  process.exit(failed ? 1 : 0);
})();

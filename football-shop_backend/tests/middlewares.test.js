// Tests de la "cola" de errores sin dependencias instaladas: zod y slugify se sustituyen por fakes mínimos.
// NO validan los esquemas Zod reales (eso requiere `npm install`). Ejecutar: npm test
const assert = require('assert');
const Module = require('module');
const path = require('path');

class FakeZodError extends Error {
  constructor(issues) { super('zod'); this.name = 'ZodError'; this.issues = issues; }
}
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'zod') return { ZodError: FakeZodError };
  if (request === 'slugify') return (t) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return origLoad.call(this, request, ...rest);
};

const r = (p) => require(path.join(__dirname, '..', p));
const AppError = r('utils/AppError');
const wrapDbError = r('utils/wrapDbError');
const { generateSlug, generateUniqueSlug } = r('utils/slugify');
const validate = r('middlewares/validate.middleware');
const { notFoundHandler, errorHandler } = r('middlewares/error.middleware');

const mockRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const run = (err, env) => {
  process.env.NODE_ENV = env;
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  return res;
};

const tests = {
  appError() {
    const e = new AppError('x', 404, 'NOT_FOUND');
    assert.deepStrictEqual([e.statusCode, e.code, e.isOperational], [404, 'NOT_FOUND', true]);
    assert.strictEqual(new AppError('y', 409).code, 'CONFLICT');
    assert.ok(e instanceof Error);
  },
  handlerAppError() {
    const res = run(new AppError('Producto no encontrado', 404, 'NOT_FOUND'), 'test');
    assert.strictEqual(res.statusCode, 404);
    assert.deepStrictEqual(res.body, { success: false, error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });
  },
  handlerZod() {
    const res = run(new FakeZodError([{ path: ['body', 'price'], message: 'Precio no válido' }]), 'test');
    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body.error, {
      code: 'VALIDATION_ERROR', message: 'Datos de entrada no válidos',
      details: [{ field: 'body.price', message: 'Precio no válido' }]
    });
  },
  handler500() {
    const boom = new Error('secreto interno');
    const prod = run(boom, 'production');
    assert.strictEqual(prod.statusCode, 500);
    assert.deepStrictEqual(prod.body, { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
    const dev = run(boom, 'development');
    assert.strictEqual(dev.body.error.message, 'secreto interno');
    assert.ok(dev.body.error.stack);
  },
  handler500AppErrorEnProduccion() {
    const res = run(wrapDbError(new Error('conexión caída: mongodb://user:pass@host'), 'listar los productos'), 'production');
    assert.strictEqual(res.body.error.code, 'DATABASE_ERROR');
    assert.strictEqual(res.body.error.message, 'Error interno del servidor');
  },
  handlerNormaliza() {
    assert.strictEqual(run(Object.assign(new Error('d'), { code: 11000, keyValue: { name: 'a' } }), 'test').statusCode, 409);
    assert.strictEqual(run(Object.assign(new Error('j'), { type: 'entity.parse.failed' }), 'test').body.error.code, 'INVALID_JSON');
    const v = run(Object.assign(new Error('v'), { name: 'ValidationError', errors: { price: { path: 'price', message: 'm' } } }), 'test');
    assert.strictEqual(v.body.error.details[0].field, 'price');
  },
  handlerNoRevelaStackEnProduccion() {
    assert.strictEqual(run(new Error('x'), 'production').body.error.stack, undefined);
  },
  notFound() {
    let received;
    notFoundHandler({ method: 'GET', originalUrl: '/nada' }, {}, (e) => { received = e; });
    assert.deepStrictEqual([received.statusCode, received.code], [404, 'NOT_FOUND']);
  },
  wrapDbError() {
    const dup = Object.assign(new Error('d'), { code: 11000 });
    assert.strictEqual(wrapDbError(dup, 'x'), dup);
    const w = wrapDbError(new Error('raw'), 'crear el producto');
    assert.ok(w instanceof AppError && w.cause.message === 'raw' && w.statusCode === 500);
  },
  async validateOk() {
    const schema = { safeParseAsync: async (i) => ({ success: true, data: { body: { n: 1 }, params: i.params, query: { page: 1 } } }) };
    const req = { body: { n: '1', extra: 1 }, params: { id: 'a' }, query: { page: '1' } };
    let called = false;
    await validate(schema)(req, mockRes(), () => { called = true; });
    assert.ok(called);
    assert.deepStrictEqual([req.body, req.query], [{ n: 1 }, { page: 1 }]);
  },
  async validateFail() {
    const schema = { safeParseAsync: async () => ({ success: false, error: new FakeZodError([{ path: ['params', 'id'], message: 'El ID no es válido' }]) }) };
    const res = mockRes();
    let called = false;
    await validate(schema)({ body: {}, params: {}, query: {} }, res, () => { called = true; });
    assert.strictEqual(called, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error.details[0].field, 'params.id');
  },
  async validateErrorInterno() {
    let err;
    await validate({ safeParseAsync: async () => { throw new Error('boom'); } })({}, mockRes(), (e) => { err = e; });
    assert.strictEqual(err.message, 'boom');
  },
  async slugs() {
    assert.strictEqual(generateSlug('  Mi Título '), 'mi-t-tulo'); // el fake no transliterea; el paquete real sí
    assert.throws(() => generateSlug(''), (e) => e.statusCode === 400);
    assert.throws(() => generateSlug(42), (e) => e.code === 'INVALID_SLUG_SOURCE');
    const taken = new Set(['mi-titulo', 'mi-titulo-2']);
    assert.strictEqual(await generateUniqueSlug('Mi titulo', async (s) => taken.has(s)), 'mi-titulo-3');
    assert.strictEqual(await generateUniqueSlug('Libre', () => false), 'libre');
  }
};

(async () => {
  let failed = 0;
  for (const [name, fn] of Object.entries(tests)) {
    try { await fn(); console.log(`✓ ${name}`); } catch (e) { failed += 1; console.error(`✗ ${name}\n  ${e.stack}`); }
  }
  process.exit(failed ? 1 : 0);
})();

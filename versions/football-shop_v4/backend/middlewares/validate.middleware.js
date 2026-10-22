const { buildValidationErrorBody } = require('../utils/zodError');

// Asigna con defineProperty para funcionar igual en Express 4 y 5 (en 5, req.query es solo lectura)
const replaceRequestProp = (req, key, value) => {
  Object.defineProperty(req, key, { value, writable: true, configurable: true, enumerable: true });
};

// schema: z.object({ body, params, query }). Las claves que el esquema no declare se dejan intactas.
const validate = (schema) => async (req, res, next) => {
  try {
    const result = await schema.safeParseAsync({ body: req.body ?? {}, params: req.params, query: req.query });

    if (!result.success) {
      return res.status(400).json(buildValidationErrorBody(result.error));
    }

    ['body', 'params', 'query'].forEach((key) => {
      if (result.data[key] !== undefined) replaceRequestProp(req, key, result.data[key]);
    });
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validate;

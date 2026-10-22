const slugifyLib = require('slugify');
const AppError = require('./AppError');

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_OPTIONS = { lower: true, strict: true, trim: true, locale: 'es' };

// "Camiseta Real Madrid" → "camiseta-real-madrid"
const generateSlug = (text) => {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new AppError('El texto para generar el slug debe ser un string no vacío', 400, 'INVALID_SLUG_SOURCE');
  }
  const slug = slugifyLib(text, SLUG_OPTIONS);
  if (!slug) {
    throw new AppError('No se puede generar un slug a partir del texto indicado', 400, 'INVALID_SLUG_SOURCE');
  }
  return slug;
};

// existsFn(slug) → Promise<boolean> | boolean. Devuelve slug, slug-2, slug-3...
const generateUniqueSlug = async (text, existsFn) => {
  if (typeof existsFn !== 'function') {
    throw new TypeError('generateUniqueSlug necesita una función existsFn(slug)');
  }
  const base = generateSlug(text);
  let candidate = base;
  let suffix = 2;
  // Secuencial a propósito: cada candidato depende del resultado anterior
  while (await existsFn(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
};

module.exports = { SLUG_REGEX, generateSlug, generateUniqueSlug };

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
require('../models/category.model');
const Product = require('../models/product.model');
const Variant = require('../models/variant.model');

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const token = (value) => normalize(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
const optionFor = (kind, value) => ({
  key: `${kind}-${token(value)}`,
  value,
  name: kind === 'color' ? `Color ${value}` : `Talla ${value}`,
  kind
});

const optionsFor = (product) => {
  const category = normalize(product.category_id?.name);
  const name = normalize(product.name);

  if (category === 'camisetas') return ['S', 'M', 'L', 'XL', 'XXL'].map((size) => optionFor('size', size));
  if (category === 'botas') return ['39', '40', '41', '42', '43', '44', '45'].map((size) => optionFor('size', size));
  if (category === 'balones') return ['3', '4', '5'].map((size) => optionFor('size', size));
  if (category === 'equipamiento' && name.includes('guantes')) {
    return ['8', '9', '10', '11'].map((size) => optionFor('size', size));
  }
  if (category === 'equipamiento') return ['S', 'M', 'L'].map((size) => optionFor('size', size));
  if (category === 'accesorios') return [optionFor('size', 'Única')];
  return ['S', 'M', 'L'].map((size) => optionFor('size', size));
};

const optionForVariant = (variant, kind, fallback) => {
  if (kind === 'color') {
    return optionFor('color', variant.attributes?.color || fallback.value);
  }

  const namedSize = String(variant.attributes?.size || variant.name.split(' - ').pop() || fallback.value)
    .replace(/^talla\s*/i, '')
    .trim();
  return optionFor('size', namedSize || fallback.value);
};

const preference = (variant) => [
  /^LEGACY-/i.test(variant.sku) ? 1 : 0,
  variant.is_default ? 0 : 1,
  new Date(variant.createdAt || 0).getTime()
];

const comparePreference = (left, right, keepOriginal = false) => {
  if (keepOriginal) {
    const leftGenerated = /^VAR-/i.test(left.sku) ? 1 : 0;
    const rightGenerated = /^VAR-/i.test(right.sku) ? 1 : 0;
    if (leftGenerated !== rightGenerated) return leftGenerated - rightGenerated;
  }
  const a = preference(left);
  const b = preference(right);
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
};

const distributeStock = (total, count) => {
  const stock = Array(count).fill(Math.floor(total / count));
  for (let index = 0; index < total % count; index += 1) stock[index] += 1;
  return stock;
};

const migrate = async () => {
  await connectDB();
  const products = await Product.find({ deletedAt: null }).populate('category_id').lean();
  const allVariants = await Variant.find({ product_id: { $in: products.map((product) => product._id) } }).lean();
  const variantsByProduct = new Map();
  for (const variant of allVariants) {
    const key = String(variant.product_id);
    variantsByProduct.set(key, [...(variantsByProduct.get(key) || []), variant]);
  }

  let created = 0;
  let archived = 0;
  let updated = 0;
  let skipped = 0;
  let restoredAccessoryStock = 0;
  const now = new Date();

  for (const product of products) {
    const productVariants = variantsByProduct.get(String(product._id)) || [];
    const existing = productVariants.filter((variant) => !variant.deletedAt);
    if (!existing.length) {
      skipped += 1;
      continue;
    }

    const isAccessory = normalize(product.category_id?.name) === 'accesorios';
    let options = optionsFor(product);
    const groups = new Map();
    for (const variant of existing) {
      const option = optionForVariant(variant, options[0].kind, options[0]);
      if (!options.some((candidate) => candidate.key === option.key)) options.push(option);
      groups.set(option.key, [...(groups.get(option.key) || []), variant]);
    }

    const keepers = new Map();
    for (const [key, group] of groups) {
      group.sort((left, right) => comparePreference(left, right, isAccessory));
      keepers.set(key, group[0]);
      if (isAccessory && group.length > 1) {
        group[0].stock = group.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0);
      }
      for (const duplicate of group.slice(1)) {
        await Variant.updateOne(
          { _id: duplicate._id },
          { $set: { deletedAt: now, isActive: false, is_default: false, ...(isAccessory ? { stock: 0 } : {}) } }
        );
        archived += 1;
      }
    }

    if (isAccessory) {
      const generatedColorPrefix = `VAR-${product._id}-COLOR-`.toUpperCase();
      const archivedColors = productVariants.filter(
        (variant) => variant.deletedAt && String(variant.sku || '').startsWith(generatedColorPrefix)
      );
      const archivedStock = archivedColors.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0);
      if (archivedStock) {
        const original = keepers.get(options[0].key) || keepers.values().next().value;
        original.stock = (Number(original.stock) || 0) + archivedStock;
        await Promise.all([
          Variant.updateOne({ _id: original._id }, { $set: { stock: original.stock } }),
          ...archivedColors.map((variant) => Variant.updateOne({ _id: variant._id }, { $set: { stock: 0 } }))
        ]);
        restoredAccessoryStock += archivedStock;
      }
    }

    const defaultVariant = [...keepers.entries()]
      .filter(([, variant]) => variant.is_default)
      .map(([key, variant]) => ({ key, variant }))
      .sort((left, right) => comparePreference(left.variant, right.variant))[0];
    const defaultKey = defaultVariant?.key || options[0].key;
    const baseVariant = defaultVariant?.variant || keepers.values().next().value;
    const totalStock = [...keepers.values()].reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0);
    const stockByOption = distributeStock(totalStock, options.length);
    const basePrice = mongoose.Types.Decimal128.fromString(baseVariant.price.toString());
    for (const variant of keepers.values()) {
      await Variant.updateOne({ _id: variant._id }, { $set: { is_default: false } });
    }

    let defaultVariantId;
    for (const [index, option] of options.entries()) {
      const current = keepers.get(option.key);
      const attributes = { ...(current?.attributes || baseVariant.attributes || {}) };
      if (option.kind === 'color') {
        attributes.size = attributes.size || 'Única';
        attributes.color = option.value;
      } else {
        attributes.size = option.value;
        if (isAccessory) delete attributes.color;
      }
      const values = {
        name: isAccessory ? `${product.name} - Única` : option.name,
        attributes,
        stock: stockByOption[index],
        is_default: false,
        status: current?.status || baseVariant.status || product.status || 'pending',
        isActive: current?.isActive !== false && product.isActive !== false
      };

      if (current) {
        await Variant.updateOne({ _id: current._id }, { $set: values }, { runValidators: true });
        updated += 1;
        if (option.key === defaultKey) defaultVariantId = current._id;
        continue;
      }

      const sku = `VAR-${product._id}-${option.key}`;
      const existingSku = await Variant.findOne({ sku });
      if (existingSku && String(existingSku.product_id) !== String(product._id)) {
        throw new Error(`El SKU generado ${sku} ya pertenece a otro producto`);
      }
      if (existingSku) {
        await Variant.updateOne(
          { _id: existingSku._id },
          {
            $set: {
              ...values,
              product_id: product._id,
              price: basePrice,
              compare_at_price: baseVariant.compare_at_price ?? null,
              deletedAt: null
            }
          },
          { runValidators: true }
        );
        if (option.key === defaultKey) defaultVariantId = existingSku._id;
        updated += 1;
      } else {
        const createdVariant = await Variant.create({
          ...values,
          product_id: product._id,
          sku,
          price: basePrice,
          compare_at_price: baseVariant.compare_at_price ?? null
        });
        if (option.key === defaultKey) defaultVariantId = createdVariant._id;
        created += 1;
      }
    }
    await Variant.updateOne({ _id: defaultVariantId }, { $set: { is_default: true } }, { runValidators: true });
  }

  console.log(
    `Variantes actualizadas: ${updated}; nuevas: ${created}; duplicadas archivadas: ${archived}; stock de accesorios restaurado: ${restoredAccessoryStock}; productos sin variantes: ${skipped}.`
  );
};

migrate()
  .catch((error) => {
    console.error('Error en la migracion de variantes:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

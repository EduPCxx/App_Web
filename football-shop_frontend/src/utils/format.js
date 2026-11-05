export const formatPrice = (value) =>
  Number(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export const formatNumber = (value) => Number(value).toLocaleString('es-ES');

export const formatDate = (value) => new Date(value).toLocaleString('es-ES');

export const formatSubtitle = ({ category_id: category, brand_id: brand }) =>
  [category?.name, brand?.name].filter(Boolean).join(' · ');

export const getProductStock = (product) => (product.variants || []).reduce((total, variant) => total + Number(variant.stock || 0), 0);

export const getProductPrice = (product) => {
  const variant = (product.variants || []).find((item) => item.is_default) || product.variants?.[0];
  return Number(variant?.price || 0);
};

// Un producto sin el campo (datos anteriores a la migración) se considera activo
export const isProductActive = (product) => product.isActive !== false;

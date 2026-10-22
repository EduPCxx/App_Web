export const formatPrice = (value) =>
  Number(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export const formatDate = (value) => new Date(value).toLocaleString('es-ES');

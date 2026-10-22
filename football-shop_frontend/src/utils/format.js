export const formatPrice = (value) =>
  Number(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export const formatNumber = (value) => Number(value).toLocaleString('es-ES');

export const formatDate = (value) => new Date(value).toLocaleString('es-ES');

// "FC Barcelona · Nike"; si el producto no es de un equipo ("N/A") solo muestra la marca
export const formatSubtitle = ({ team, brand }) => (team && team !== 'N/A' ? `${team} · ${brand}` : brand);

// Un producto sin el campo (datos anteriores a la migración) se considera activo
export const isProductActive = (product) => product.isActive !== false;

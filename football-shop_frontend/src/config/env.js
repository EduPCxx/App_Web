export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// La documentación Swagger cuelga de la raíz del backend (…/api-docs)
export const API_DOCS_URL = `${API_URL.replace(/\/api$/, '')}/api-docs`;

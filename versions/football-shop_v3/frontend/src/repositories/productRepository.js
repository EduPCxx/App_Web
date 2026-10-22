import { request } from './httpClient';

const withBody = (method, data) => ({ method, body: JSON.stringify(data) });

export const productRepository = {
  list: (query) => request(`/products?${new URLSearchParams(query)}`),
  get: (id) => request(`/products/${id}`),
  create: (data) => request('/products', withBody('POST', data)),
  update: (id, data) => request(`/products/${id}`, withBody('PUT', data)),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' })
};

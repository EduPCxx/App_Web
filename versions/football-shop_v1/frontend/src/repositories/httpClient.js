import ApiError from '../utils/ApiError';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new ApiError('No se pudo conectar con la API');
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const details = body?.errors?.map((e) => e.message).join(' · ');
    throw new ApiError(details || body?.message || `Error ${response.status}`, response.status);
  }

  return body;
}

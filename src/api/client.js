export const BASE_URL = (import.meta.env.VITE_API_URL || 'https://mr-home-backend.vercel.app/api').replace(/\/$/, '');
const TOKEN_KEY = 'store_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const DEVICE_KEY = 'device_id';

/** Anonymous id for this browser, so guests get their own notification read-state. */
export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

async function request(method, path, body, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body && JSON.stringify(body) });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

const withQuery = (path, params) => {
  const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return qs ? `${path}?${qs}` : path;
};

export const http = {
  get: (path, params, headers) => request('GET', withQuery(path, params), undefined, headers),
  post: (path, body, headers) => request('POST', path, body, headers),
  patch: (path, body) => request('PATCH', path, body),
};

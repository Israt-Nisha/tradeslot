const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export type APIResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type FetchOptions = RequestInit & {
  body?: any;
};

async function fetcher<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Build headers
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Retrieve token from localStorage (if running in browser context)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const fetchConfig: RequestInit = {
    ...options,
    headers,
  };

  if (options.body) {
    fetchConfig.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchConfig);

  // Attempt to parse JSON response
  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage = data?.message || response.statusText || 'An unexpected error occurred';
    throw new Error(errorMessage);
  }

  return data as T;
}

export const fetchClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetcher<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetcher<T>(endpoint, { ...options, method: 'POST', body }),

  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetcher<T>(endpoint, { ...options, method: 'PATCH', body }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetcher<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetcher<T>(endpoint, { ...options, method: 'DELETE' }),
};

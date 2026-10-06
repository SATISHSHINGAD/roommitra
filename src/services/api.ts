// RoomMitra Frontend API Service Layer

const BASE_URL = '';

export function getStoredToken(): string | null {
  return localStorage.getItem('roommitra_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('roommitra_token', token);
  } else {
    localStorage.removeItem('roommitra_token');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

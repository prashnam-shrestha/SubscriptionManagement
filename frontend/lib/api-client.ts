let memoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => memoryAccessToken;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api/v1';

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!options.skipAuth && memoryAccessToken) {
    headers.Authorization = `Bearer ${memoryAccessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle expired access token with one silent refresh attempt.
  if (
    response.status === 401 &&
    !options.skipAuth &&
    !endpoint.includes('/auth/refresh')
  ) {
    const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      const refreshPayload = await refreshResponse.json();
      const newToken = refreshPayload.data?.accessToken;

      if (newToken) {
        setAccessToken(newToken);
        headers.Authorization = `Bearer ${newToken}`;

        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        setAccessToken(null);

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        throw new Error('Session expired');
      }
    } else {
      setAccessToken(null);

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      throw new Error('Session expired');
    }
  }

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.error?.message ||
        payload.message ||
        'API request failed',
    );
  }

  return payload.data !== undefined ? payload.data : payload;
}

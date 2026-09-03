import { getSession } from '../auth/tokenStorage';
import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, body, headers, ...requestOptions } = options;
  const session = authenticated ? await getSession() : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const rawBody = await response.text();
  const data = rawBody ? tryParseJson(rawBody) : undefined;

  if (!response.ok) {
    const message = getErrorMessage(data) ?? `요청에 실패했습니다. (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getErrorMessage(data: unknown): string | undefined {
  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }

  return undefined;
}

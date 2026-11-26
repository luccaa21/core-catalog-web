import { getToken } from "./auth";

export const API = process.env.NEXT_PUBLIC_API_URL;

export function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export function apiFetch(path: string, { method, body, auth = false }: ApiFetchOptions = {}) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) Object.assign(headers, authHeaders());

  return fetch(`${API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
  return String(message ?? fallback);
}

export async function readJsonOrNull<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}

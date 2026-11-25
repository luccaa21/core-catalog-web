import { getToken } from "./auth";

export const API = process.env.NEXT_PUBLIC_API_URL;

export function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

type ApiFetchOptions = {
  method?: string;
  /** Corpo da requisição; é serializado como JSON. */
  body?: unknown;
  /** Envia o token do usuário logado. */
  auth?: boolean;
};

/** Wrapper do fetch para a API: monta a URL, o token e o corpo JSON. */
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

/** Lê a mensagem de erro devolvida pela API (string ou lista), ou usa o texto padrão. */
export async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
  return String(message ?? fallback);
}

/** A API responde corpo vazio (null) quando o recurso não existe; trata isso como null. */
export async function readJsonOrNull<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}

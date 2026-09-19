/**
 * Erreur retournée par l'API : porte le statut HTTP et les erreurs de validation.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const baseUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/v1`;

export type QueryParams = Record<string, string | number | undefined>;

/**
 * Sérialise les paramètres en chaîne de requête, en ignorant les valeurs vides.
 * @param params - Objet clé/valeur à encoder.
 * @returns La chaîne de requête (ex. `?page=1`), ou `''` si aucun paramètre.
 */
export function toQuery(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Requête fetch + lecture du JSON ; lève un ApiError en cas d'échec réseau ou HTTP.
 */
async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Unable to reach the API');
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    let errors: Record<string, string[]> | undefined;

    const body = await res.json().catch(() => null);
    if (body && typeof body === 'object') {
      if (typeof body.message === 'string') {
        message = body.message;
      }

      if (body.errors && typeof body.errors === 'object') {
        errors = body.errors;
      }
    }

    throw new ApiError(res.status, message, errors);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

/**
 * Client HTTP minimal : une méthode par verbe REST, typée par le générique T.
 */
export const api = {
  get: <T>(path: string) => fetchJSON<T>(path),
  post: <T>(path: string, body?: unknown) =>
    fetchJSON<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    fetchJSON<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => fetchJSON<T>(path, { method: 'DELETE' }),
};

export const DEFAULT_COMPANY_ID = 1;

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7263/api";

// Ny helper – bygger ?from=...&to=... osv
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("API error", response.status, text);
    throw new Error(`API error ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    // @ts-ignore
    return undefined;
  }

  return (await response.json()) as T;
}

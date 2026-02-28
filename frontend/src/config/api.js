const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedApiBaseUrl) {
    return normalizedPath;
  }

  return `${normalizedApiBaseUrl}${normalizedPath}`;
}

const AUTH_KEY = "event-platform-admin-auth";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;
const AUTH_EVENT = "auth-changed";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin@123";

export function isAdminAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) {
      return false;
    }

    if (raw === "true") {
      setAdminAuthenticated(true);
      return true;
    }

    if (raw === "false") {
      window.localStorage.removeItem(AUTH_KEY);
      return false;
    }

    const parsed = JSON.parse(raw);
    const expiresAt = Number(parsed?.expiresAt || 0);
    const now = Date.now();

    if (!expiresAt || now >= expiresAt) {
      window.localStorage.removeItem(AUTH_KEY);
      return false;
    }

    window.localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        ...parsed,
        active: true,
        expiresAt: now + SESSION_DURATION_MS
      })
    );

    return parsed?.active === true;
  } catch {
    window.localStorage.removeItem(AUTH_KEY);
    return false;
  }
}

export function setAdminAuthenticated(value) {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
    return;
  }

  window.localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      active: true,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS
    })
  );
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function getAuthEventName() {
  return AUTH_EVENT;
}

const AUTH_KEY = "event-platform-admin-auth";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin@123";

export function isAdminAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_KEY) === "true";
}

export function setAdminAuthenticated(value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_KEY, value ? "true" : "false");
}

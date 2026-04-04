import { buildApiUrl } from "../config/api";

const STORAGE_KEY = "event-platform-social-links";

export const defaultSocialLinks = {
  facebook: "https://www.facebook.com",
  instagram: "https://www.instagram.com",
  whatsapp: "https://wa.me/919000000000",
  youtube: "https://www.youtube.com"
};

function readLocalSocialLinks() {
  if (typeof window === "undefined") {
    return defaultSocialLinks;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSocialLinks;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultSocialLinks,
      ...(parsed || {})
    };
  } catch {
    return defaultSocialLinks;
  }
}

function writeLocalSocialLinks(links) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  window.dispatchEvent(new CustomEvent("social-links-updated"));
}

async function syncSocialLinksFromServer() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const response = await fetch(buildApiUrl("/api/content/social"), {
      credentials: "include"
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const links = {
      ...defaultSocialLinks,
      ...(data?.links || readLocalSocialLinks())
    };
    writeLocalSocialLinks(links);
  } catch {
    // Keep local cache silently.
  }
}

export function loadSocialLinks() {
  const localLinks = readLocalSocialLinks();
  void syncSocialLinksFromServer();
  return localLinks;
}

export function saveSocialLinks(links) {
  const mergedLinks = {
    ...defaultSocialLinks,
    ...(links || {})
  };

  writeLocalSocialLinks(mergedLinks);

  return fetch(buildApiUrl("/api/content/social"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ links: mergedLinks })
  });
}

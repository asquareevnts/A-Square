const STORAGE_KEY = "event-platform-social-links";

export const defaultSocialLinks = {
  facebook: "https://www.facebook.com",
  instagram: "https://www.instagram.com",
  whatsapp: "https://wa.me/919000000000",
  youtube: "https://www.youtube.com"
};

export function loadSocialLinks() {
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

export function saveSocialLinks(links) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  window.dispatchEvent(new CustomEvent("social-links-updated"));
}

import placeholderImage from "../assets/Logo.png";
import { buildApiUrl } from "../config/api";

const STORAGE_KEY = "event-platform-gallery";

export const defaultGalleryItems = [
  { id: 1, title: "Stage Highlights", image: placeholderImage },
  { id: 2, title: "Audience Moments", image: placeholderImage },
  { id: 3, title: "Speaker Sessions", image: placeholderImage },
  { id: 4, title: "Brand Activations", image: placeholderImage }
];

function normalizeGallery(items) {
  return items.map((item, index) => ({
    id: item?.id ?? Date.now() + index,
    title: item?.title || `Gallery Item ${index + 1}`,
    image: item?.image || placeholderImage
  }));
}

function readLocalGalleryItems() {
  if (typeof window === "undefined") {
    return defaultGalleryItems;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultGalleryItems;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeGallery(parsed) : defaultGalleryItems;
  } catch {
    return defaultGalleryItems;
  }
}

function writeLocalGalleryItems(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("gallery-updated"));
}

async function syncGalleryFromServer() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const response = await fetch(buildApiUrl("/api/content/gallery"), {
      credentials: "include"
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const items = Array.isArray(data?.items)
      ? normalizeGallery(data.items)
      : readLocalGalleryItems();

    writeLocalGalleryItems(items);
  } catch {
    // Keep local fallback silently
  }
}

export function loadGalleryItems() {
  const localItems = readLocalGalleryItems();
  void syncGalleryFromServer();
  return localItems;
}

export async function saveGalleryItems(items) {
  const normalized = normalizeGallery(items || []);
  writeLocalGalleryItems(normalized);

  try {
    const response = await fetch(buildApiUrl("/api/content/gallery"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: normalized })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data?.message || `Failed to sync gallery (${response.status})` };
    }

    const data = await response.json().catch(() => ({}));
    const serverItems = Array.isArray(data?.items) ? normalizeGallery(data.items) : normalized;
    writeLocalGalleryItems(serverItems);
    return { success: true };
  } catch {
    return { success: false, message: "Unable to reach server. Gallery saved only on this device." };
  }
}

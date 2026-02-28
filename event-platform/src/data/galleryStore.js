import placeholderImage from "../assets/Logo.png";

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

export function loadGalleryItems() {
  if (typeof window === "undefined") {
    return defaultGalleryItems;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultGalleryItems;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? normalizeGallery(parsed) : defaultGalleryItems;
  } catch {
    return defaultGalleryItems;
  }
}

export function saveGalleryItems(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("gallery-updated"));
}

import productImage from "../assets/Logo.png";

const STORAGE_KEY = "event-platform-products";

export const defaultProducts = [
  { id: 1, name: "Premium Stage Setup", image: productImage },
  { id: 2, name: "Signature Lighting Kit", image: productImage },
  { id: 3, name: "Luxury Seating Bundle", image: productImage },
  { id: 4, name: "Event Branding Standee", image: productImage },
  { id: 5, name: "Sound System Pro", image: productImage },
  { id: 6, name: "Photo Booth Corner", image: productImage }
];

export function loadProducts() {
  if (typeof window === "undefined") {
    return defaultProducts;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultProducts;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

export function saveProducts(products) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent("products-updated"));
}

import productImage from "../assets/Logo.png";
import { buildApiUrl } from "../config/api";

const STORAGE_KEY = "event-platform-products";

export const defaultProducts = [
  { id: 1, name: "Premium Stage Setup", image: productImage, price: 4999 },
  { id: 2, name: "Signature Lighting Kit", image: productImage, price: 2999 },
  { id: 3, name: "Luxury Seating Bundle", image: productImage, price: 3999 },
  { id: 4, name: "Event Branding Standee", image: productImage, price: 1499 },
  { id: 5, name: "Sound System Pro", image: productImage, price: 5499 },
  { id: 6, name: "Photo Booth Corner", image: productImage, price: 3499 }
];

function normalizeProducts(products) {
  return products.map((product, index) => ({
    id: product?.id ?? Date.now() + index,
    name: product?.name || `Product ${index + 1}`,
    image: product?.image || defaultProducts[0].image,
    price: Number(product?.price) > 0 ? Number(product.price) : 0
  }));
}

function readLocalProducts() {
  if (typeof window === "undefined") {
    return defaultProducts;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultProducts;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? normalizeProducts(parsed) : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

function writeLocalProducts(products) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent("products-updated"));
}

async function syncProductsFromServer() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const response = await fetch(buildApiUrl("/api/content/products"), {
      credentials: "include"
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const items = Array.isArray(data?.items) && data.items.length
      ? normalizeProducts(data.items)
      : readLocalProducts();

    writeLocalProducts(items);
  } catch {
    // Keep local fallback silently
  }
}

export function loadProducts() {
  const localProducts = readLocalProducts();
  void syncProductsFromServer();
  return localProducts;
}

export async function saveProducts(products) {
  const normalized = normalizeProducts(products || []);
  writeLocalProducts(normalized);

  try {
    const response = await fetch(buildApiUrl("/api/content/products"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: normalized })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = data?.message || `Failed to sync products (${response.status})`;
      return { success: false, message: errorMessage };
    }

    const data = await response.json().catch(() => ({}));
    const serverItems = Array.isArray(data?.items) ? normalizeProducts(data.items) : normalized;
    writeLocalProducts(serverItems);
    return { success: true };
  } catch {
    return { success: false, message: "Unable to reach server. Product saved only on this device." };
  }
}

import productImage from "../assets/Logo.png";

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
    return Array.isArray(parsed) && parsed.length ? normalizeProducts(parsed) : defaultProducts;
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

import { useEffect, useState } from "react";
import { loadProducts } from "../data/productsStore";

export default function Products() {
  const [products, setProducts] = useState(() => loadProducts());

  useEffect(() => {
    function refreshProducts() {
      setProducts(loadProducts());
    }

    window.addEventListener("products-updated", refreshProducts);
    window.addEventListener("storage", refreshProducts);

    return () => {
      window.removeEventListener("products-updated", refreshProducts);
      window.removeEventListener("storage", refreshProducts);
    };
  }, []);

  return (
    <section className="min-h-screen bg-white px-6 pb-20 pt-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Products</h1>
        <p className="mt-3 text-slate-600">Explore our featured products for premium events.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="overflow-hidden rounded-xl bg-slate-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-56 w-full object-cover"
                />
              </div>
              <p className="mt-4 text-center text-lg font-semibold text-slate-900">{product.name}</p>
              <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                Book Now
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
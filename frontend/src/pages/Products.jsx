import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCheck, FiX } from "react-icons/fi";
import { loadProducts } from "../data/productsStore";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { isAdminAuthenticated } from "../utils/adminAuth";

export default function Products() {
  const [products, setProducts] = useState(() => loadProducts());
  const [addedIds, setAddedIds] = useState(new Set());
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [toast, setToast] = useState(null); // { name: string }
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSignedIn = Boolean(user) || isAdminAuthenticated();

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

  function handleAddToCart(product) {
    if (!isSignedIn) {
      setShowSignInModal(true);
      return;
    }
    addToCart(product);
    setAddedIds((prev) => new Set(prev).add(product.id));

    // Show bottom toast
    setToast({ name: product.name });
    clearTimeout(window._cartToastTimer);
    window._cartToastTimer = setTimeout(() => setToast(null), 3000);

    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  }

  return (
    <>
    {/* Bottom toast notification */}
    <div
      className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 md:bottom-6 ${
        toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 shadow-xl text-white min-w-[260px] max-w-xs">
        <FiCheck className="shrink-0 text-green-400" size={18} />
        <p className="flex-1 text-sm font-medium truncate">
          <span className="text-slate-300">Added</span> {toast?.name}
        </p>
        <button
          onClick={() => { setToast(null); navigate("/cart"); }}
          className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition"
        >
          Go to Cart
        </button>
      </div>
    </div>

    {/* Sign-in prompt modal */}
    {showSignInModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={() => setShowSignInModal(false)}
      >
        <div
          className="relative w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowSignInModal(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <FiShoppingCart className="text-indigo-600" size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sign in to add to cart</h2>
            <p className="mt-2 text-sm text-slate-500">
              You need to be signed in before adding products to your cart.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate("/signin?redirect=/products")}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-semibold text-white transition hover:from-indigo-700 hover:to-purple-700"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup?redirect=/products")}
              className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
            >
              Create an Account
            </button>
            <button
              onClick={() => setShowSignInModal(false)}
              className="text-sm text-slate-400 hover:text-slate-600 transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    )}
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Products</h1>
            <p className="mt-3 text-slate-600">Explore our featured products for premium events.</p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition"
          >
            <FiShoppingCart size={16} />
            Go to Cart
          </button>
        </div>

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
                  className="h-48 w-full object-cover sm:h-56"
                />
              </div>
              <p className="mt-4 text-center text-lg font-semibold text-slate-900">{product.name}</p>
              <p className="mt-1 text-center text-base font-medium text-slate-600">
                ₹ {Number(product.price).toLocaleString("en-IN")}
              </p>
              <button
                onClick={() => handleAddToCart(product)}
                className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  addedIds.has(product.id)
                    ? "bg-green-600 text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {addedIds.has(product.id) ? (
                  <>
                    <FiCheck size={15} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <FiShoppingCart size={15} />
                    Add to Cart
                  </>
                )}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
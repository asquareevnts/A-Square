import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingBag, FiStar, FiTruck, FiShield, FiRefreshCw, FiShoppingCart } from "react-icons/fi";
import { loadProducts } from "../data/productsStore";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" } }),
};

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => loadProducts().slice(0, 3));
  const [addedIds, setAddedIds] = useState(new Set());
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isSignedIn = Boolean(user);

  useEffect(() => {
    function refresh() { setProducts(loadProducts().slice(0, 3)); }
    window.addEventListener("products-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("products-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function handleAddToCart(product) {
    if (!isSignedIn) { navigate("/signin?redirect=/"); return; }
    addToCart(product);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(product.id); return n; }), 1500);
  }

  const trustItems = [
    { icon: FiTruck,     title: "Fast Delivery",      desc: "Quick dispatch for all event orders" },
    { icon: FiShield,    title: "Transparent Quotes",  desc: "Get pricing confirmation from our team" },
    { icon: FiStar,      title: "Premium Quality",     desc: "Curated for memorable experiences" },
    { icon: FiRefreshCw, title: "Easy Returns",        desc: "Hassle-free 7-day return policy" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 pb-16 pt-10 sm:px-6 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
                <FiShoppingBag size={14} /> Premium Event Merchandise
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Elevate Every
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Event Moment</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Discover premium stage setups, lighting kits, seating bundles and event branding — all in one place, delivered fast.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3 font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => navigate("/events")}
                  className="rounded-xl border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-800 transition hover:border-indigo-400 hover:text-indigo-600"
                >
                  View Events
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><FiStar className="text-amber-400" /> 4.9 Rated</span>
                <span>•</span>
                <span>35K+ Happy Customers</span>
                <span>•</span>
                <span>120+ Events Powered</span>
              </div>
            </motion.div>

            <motion.div
              initial="hidden" animate="show" custom={1} variants={fadeUp}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Products", value: "50+",  sub: "Premium items" },
                { label: "Events",   value: "120+", sub: "+18% this month" },
                { label: "Cities",   value: "15+",  sub: "Pan India" },
                { label: "Clients",  value: "500+", sub: "Trusted brands" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-indigo-600">{stat.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="show" custom={i * 0.05} variants={fadeUp} viewport={{ once: true }}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                  <Icon className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest">Top Picks</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">Featured Products</h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition sm:block"
            >
              View All →
            </button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.length > 0 ? products.map((product, i) => (
              <motion.article
                key={product.id}
                initial="hidden" whileInView="show" custom={i * 0.08} variants={fadeUp} viewport={{ once: true }}
                className="group rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="overflow-hidden rounded-xl bg-slate-50/80">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-52"
                  />
                </div>
                <p className="mt-4 text-center text-lg font-semibold text-slate-900">{product.name}</p>
                <p className="mt-1 text-center text-base font-medium text-indigo-600">
                  ₹ {Number(product.price).toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    addedIds.has(product.id)
                      ? "bg-green-600 text-white"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <FiShoppingCart size={15} />
                  {addedIds.has(product.id) ? "Added!" : "Add to Cart"}
                </button>
              </motion.article>
            )) : (
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm sm:col-span-2 lg:col-span-3">
                <p className="text-lg font-semibold text-slate-900">Products are being updated</p>
                <p className="mt-2 text-sm text-slate-600">No featured products available right now. Please check again in a moment.</p>
                <button
                  onClick={() => navigate("/products")}
                  className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:from-indigo-700 hover:to-purple-700"
                >
                  Open Products Page
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => navigate("/products")}
              className="rounded-xl border border-indigo-300 px-6 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">Why Asquare Events</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Built for the best event experiences</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Curated Collections",    text: "Every product is hand-picked for quality and event suitability — nothing generic, ever." },
              { title: "Quick Quote Requests",   text: "Add products to cart, share requirement date, and receive admin confirmation fast." },
              { title: "Event Expert Support",   text: "Our team understands events. Get guidance before you book or buy." },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                initial="hidden" whileInView="show" custom={i * 0.08} variants={fadeUp} viewport={{ once: true }}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to elevate your next event?</h2>
          <p className="mt-4 text-indigo-100">Browse our full catalog and get everything delivered to your venue.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/products")}
              className="rounded-xl bg-white px-8 py-3 font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Shop Products
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="rounded-xl border border-white/50 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

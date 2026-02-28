import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultProducts, loadProducts, saveProducts } from "../data/productsStore";
import { setAdminAuthenticated } from "../utils/adminAuth";

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => loadProducts());
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const totalProducts = useMemo(() => products.length, [products]);

  function resetForm() {
    setName("");
    setImage("");
    setEditingId(null);
  }

  function handleSubmitProduct(event) {
    event.preventDefault();

    const cleanedName = name.trim();
    if (!cleanedName) {
      return;
    }

    const finalImage = image.trim() || defaultProducts[0].image;

    let nextProducts;
    if (editingId) {
      nextProducts = products.map((product) =>
        product.id === editingId
          ? { ...product, name: cleanedName, image: finalImage }
          : product
      );
    } else {
      nextProducts = [
        ...products,
        {
          id: Date.now(),
          name: cleanedName,
          image: finalImage
        }
      ];
    }

    setProducts(nextProducts);
    saveProducts(nextProducts);
    resetForm();
  }

  function handleEditProduct(product) {
    setEditingId(product.id);
    setName(product.name);
    setImage(product.image);
  }

  function handleDeleteProduct(id) {
    const nextProducts = products.filter((product) => product.id !== id);
    setProducts(nextProducts);
    saveProducts(nextProducts);

    if (editingId === id) {
      resetForm();
    }
  }

  function handleResetProducts() {
    setProducts(defaultProducts);
    saveProducts(defaultProducts);
    resetForm();
  }

  function handleSignOut() {
    setAdminAuthenticated(false);
    navigate("/signin");
  }

  return (
    <section className="min-h-screen bg-white px-6 pb-20 pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600">Manage products shown to users on the Products page.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetProducts}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmitProduct} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Image URL</label>
                <input
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {editingId ? "Update Product" : "Add Product"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Products</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {totalProducts} items
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-slate-200 p-3">
                  <img src={product.image} alt={product.name} className="h-36 w-full rounded-lg object-cover" />
                  <p className="mt-3 font-semibold text-slate-900">{product.name}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
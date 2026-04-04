import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { buildApiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, removeItemCompletely, clearCart, totalPrice } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quoteForm, setQuoteForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    requirementDate: "",
    eventLocation: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const profileDefaults = useMemo(
    () => ({
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    }),
    [user]
  );

  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setRequestSuccess("");
    setQuoteForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    setQuoteForm((prev) => ({
      customerName: prev.customerName || profileDefaults.fullName || "",
      phone: prev.phone || profileDefaults.phone || "",
      email: prev.email || profileDefaults.email || "",
      requirementDate: prev.requirementDate || "",
      eventLocation: prev.eventLocation || profileDefaults.address || "",
      notes: prev.notes || "",
    }));
  }, [profileDefaults]);

  const handleGetQuote = useCallback(async () => {
    if (cartItems.length === 0) return;
    if (!quoteForm.customerName.trim() || !quoteForm.phone.trim() || !quoteForm.requirementDate) {
      setRequestError("Please fill name, phone number and required date.");
      return;
    }

    setRequestError("");
    setRequestSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch(buildApiUrl("/api/quotes/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customerName: quoteForm.customerName.trim(),
          phone: quoteForm.phone.trim(),
          email: quoteForm.email.trim(),
          requirementDate: quoteForm.requirementDate,
          eventLocation: quoteForm.eventLocation.trim(),
          notes: quoteForm.notes.trim(),
          cartItems,
          totalAmount: totalPrice,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result?.quote?.id) {
        throw new Error(result?.error || "Could not create quote request");
      }

      setRequestSuccess(`Quote request #${result.quote.id} submitted successfully.`);
      clearCart();
      navigate("/products");
    } catch (err) {
      console.error("Quote request error:", err);
      setRequestError(err.message || "Something went wrong while creating the quote request.");
    } finally {
      setIsSubmitting(false);
    }
  }, [cartItems, quoteForm, totalPrice, clearCart, navigate]);

  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Cart</h1>
          <div className="mt-20 flex flex-col items-center gap-4 text-center text-slate-500">
            <FiShoppingCart size={56} className="text-slate-300" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Cart</h1>

        <ul className="mt-8 divide-y divide-slate-100">
          {cartItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 rounded-xl object-cover border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                <p className="text-sm text-slate-500">₹ {item.price.toLocaleString("en-IN")}</p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-slate-800">
                  {item.qty}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Line total */}
              <p className="w-24 text-right text-sm font-semibold text-slate-800">
                ₹ {(item.price * item.qty).toLocaleString("en-IN")}
              </p>

              <button
                onClick={() => removeItemCompletely(item.id)}
                className="ml-1 text-slate-400 hover:text-red-500 transition"
                aria-label="Remove item"
              >
                <FiTrash2 size={16} />
              </button>
            </li>
          ))}
        </ul>

        {/* Quote summary */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between text-slate-700">
            <span>Estimated Total</span>
            <span className="font-semibold">₹ {totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Final pricing will be confirmed by admin after review</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-700">
              Full Name*
              <input
                type="text"
                name="customerName"
                value={quoteForm.customerName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="text-sm text-slate-700">
              Phone Number*
              <input
                type="tel"
                name="phone"
                value={quoteForm.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="text-sm text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={quoteForm.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="text-sm text-slate-700">
              Required Date*
              <input
                type="date"
                name="requirementDate"
                value={quoteForm.requirementDate}
                min={minDate}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          <label className="mt-3 block text-sm text-slate-700">
            Event Location
            <input
              type="text"
              name="eventLocation"
              value={quoteForm.eventLocation}
              onChange={handleInputChange}
              placeholder="City / Venue"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="mt-3 block text-sm text-slate-700">
            Additional Requirements
            <textarea
              name="notes"
              value={quoteForm.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Mention timing, setup needs, quantity notes, etc."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
            />
          </label>

          {requestError ? <p className="mt-3 text-sm font-medium text-red-600">{requestError}</p> : null}
          {requestSuccess ? <p className="mt-3 text-sm font-medium text-emerald-600">{requestSuccess}</p> : null}

          <button
            onClick={handleGetQuote}
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white transition hover:from-indigo-700 hover:to-purple-700"
          >
            {isSubmitting
              ? "Preparing Quote Request..."
              : `Get Quote for ₹ ${totalPrice.toLocaleString("en-IN")}`}
          </button>
        </div>
      </div>
    </section>
  );
}

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { buildApiUrl } from "../config/api";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, removeItemCompletely, clearCart, totalPrice } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      alert("Failed to load payment gateway. Please check your connection.");
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch(buildApiUrl("/api/payment/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: totalPrice,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            items: cartItems.map((i) => `${i.name} x${i.qty}`).join(", "),
          },
        }),
      });

      if (!res.ok) throw new Error("Could not create payment order");

      const order = await res.json();

      // 2. Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Asquare Events",
        description: "Event Products Checkout",
        order_id: order.id,
        handler: async (response) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch(buildApiUrl("/api/payment/verify"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            clearCart();
            navigate("/payment-success", {
              state: {
                paymentId: result.paymentId,
                orderId: result.orderId,
                total: totalPrice,
              },
            });
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {
            // User closed modal without paying — do nothing
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong during checkout. Please try again.");
    }
  }, [cartItems, totalPrice, clearCart, navigate]);

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

        {/* Order summary */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between text-slate-700">
            <span>Subtotal</span>
            <span className="font-semibold">₹ {totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Taxes &amp; fees may apply</span>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white transition hover:from-indigo-700 hover:to-purple-700"
          >
            Pay ₹ {totalPrice.toLocaleString("en-IN")} via Razorpay
          </button>
        </div>
      </div>
    </section>
  );
}

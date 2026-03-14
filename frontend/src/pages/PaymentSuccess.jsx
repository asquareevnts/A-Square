import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-16 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <FiCheckCircle className="mx-auto text-green-500" size={64} />
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Payment Successful!</h1>
        <p className="mt-3 text-slate-600">Thank you for your purchase. Your booking is confirmed.</p>

        {state?.paymentId && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment ID</span>
              <span className="font-mono font-medium">{state.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-medium">{state.orderId}</span>
            </div>
            {state.total && (
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="font-semibold text-slate-800">Total Paid</span>
                <span className="font-bold text-slate-900">
                  ₹ {Number(state.total).toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/products")}
          className="mt-8 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Continue Shopping
        </button>
      </div>
    </section>
  );
}

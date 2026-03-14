import { Link, useLocation } from "react-router-dom";
import { FaBoxOpen, FaCalendarAlt, FaHome, FaImages, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItem = (path, icon, label) => (
    <Link
      to={path}
      className={`flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium ${
        location.pathname === path ? "text-indigo-600" : "text-slate-500"
      }`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-around px-2 py-2">
        {navItem("/", <FaHome size={18} />, "Home")}
        {navItem("/events", <FaCalendarAlt size={18} />, "Events")}
        {navItem("/products", <FaBoxOpen size={18} />, "Products")}
        {navItem("/gallery", <FaImages size={18} />, "Gallery")}
        <Link
          to="/cart"
          className={`relative flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium ${
            location.pathname === "/cart" ? "text-indigo-600" : "text-slate-500"
          }`}
          aria-label="Cart"
        >
          <span className="relative">
            <FaShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </span>
          <span>Cart</span>
        </Link>
      </div>
    </div>
  );
}

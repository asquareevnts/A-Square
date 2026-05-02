import { Link, useLocation } from "react-router-dom";
import { FaBoxOpen, FaCalendarAlt, FaHome, FaImages, FaShoppingCart, FaTachometerAlt } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const navItem = (path, icon, label) => (
    <Link
      to={path}
      className={`flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium ${
        location.pathname === path ? "text-cyan-100" : "text-slate-300"
      }`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-white/20 bg-[#071b2ef0] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-around px-2 py-2">
        {navItem("/", <FaHome size={18} />, "Home")}
        {navItem("/events", <FaCalendarAlt size={18} />, "Events")}
        {navItem("/products", <FaBoxOpen size={18} />, "Products")}
        {isAdmin
          ? navItem("/admin", <FaTachometerAlt size={18} />, "Dashboard")
          : navItem("/gallery", <FaImages size={18} />, "Gallery")
        }
        <Link
          to="/cart"
          className={`relative flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium ${
            location.pathname === "/cart" ? "text-cyan-100" : "text-slate-300"
          }`}
          aria-label="Cart"
        >
          <span className="relative">
            <FaShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-300 text-[8px] font-bold text-slate-900">
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

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiUser, FiX, FiShoppingCart, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../assets/Logo.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { totalItems } = useCart();
  const isSignedIn = Boolean(user);
  const isAdmin = user?.role === "admin";
  const profileName = user?.fullName || user?.name || user?.email || "";

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  const navItemClass = ({ isActive }) =>
    isActive
      ? "text-indigo-700"
      : "text-slate-700 hover:text-indigo-700 transition";

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
          <img src={logo} alt="Asquare Events" className="h-10 w-auto" />
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-slate-900 sm:text-base md:text-xl">
            ASQUARE EVENTS
          </span>
        </NavLink>

        <div className="hidden md:flex gap-8 font-body text-sm">
          <NavLink to="/" className={navItemClass}>Home</NavLink>
          <NavLink to="/events" className={navItemClass}>Events</NavLink>
          <NavLink to="/gallery" className={navItemClass}>Gallery</NavLink>
          <NavLink to="/products" className={navItemClass}>Products</NavLink>
          <NavLink to="/contact" className={navItemClass}>Contact</NavLink>
        </div>

        {/* Cart icon — desktop */}
        <NavLink
          to="/cart"
          className="relative hidden items-center md:flex rounded-xl border border-slate-300 p-2.5 text-slate-700 transition hover:border-indigo-500 hover:text-indigo-700"
          aria-label="Shopping cart"
        >
          <FiShoppingCart size={18} />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-slate-900">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </NavLink>

        {!isSignedIn ? (
          <div className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/signin"
              className="font-body rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-700"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className="font-body rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-blue-600"
            >
              Sign Up
            </NavLink>
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-blue-600 shadow-sm"
              >
                <FiSettings size={15} />
                Dashboard
              </NavLink>
            ) : null}
            <NavLink
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-700"
            >
              <FiUser className="text-base" />
              <span className="max-w-[140px] truncate">{profileName}</span>
            </NavLink>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex rounded-xl border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden backdrop-blur-xl">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <NavLink to="/" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Home</NavLink>
            <NavLink to="/events" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Events</NavLink>
            <NavLink to="/gallery" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Gallery</NavLink>
            <NavLink to="/products" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Products</NavLink>
            <NavLink to="/contact" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Contact</NavLink>
            <NavLink to="/cart" onClick={closeMobileMenu} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              <FiShoppingCart size={14} />
              Cart
              {totalItems > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-slate-900">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </NavLink>
            {!isSignedIn ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <NavLink to="/signin" onClick={closeMobileMenu} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-slate-900">Sign In</NavLink>
                <NavLink to="/signup" onClick={closeMobileMenu} className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 px-3 py-2 text-center font-semibold text-white">Sign Up</NavLink>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {isAdmin ? (
                  <NavLink
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 px-3 py-2 text-center font-semibold text-white"
                  >
                    <FiSettings size={14} />
                    Admin Dashboard
                  </NavLink>
                ) : null}
                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <FiUser className="text-base" />
                  <span className="max-w-[180px] truncate">{profileName}</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

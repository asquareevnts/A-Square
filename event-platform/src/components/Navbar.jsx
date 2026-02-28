import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  const navItemClass = ({ isActive }) =>
    isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900 transition";

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* LOGO + BRAND */}
        <NavLink to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
          <img
            src={logo}
            alt="Asquare Events"
            className="h-10 w-auto"
          />
          <span className="
            font-heading
            text-sm sm:text-base md:text-xl
            font-semibold
            tracking-wide sm:tracking-widest
            text-slate-900
          ">
            ASQUARE EVENTS
          </span>
        </NavLink>

        {/* NAV LINKS */}
        <div className="hidden md:flex gap-8 font-body text-sm">
          <NavLink to="/" className={navItemClass}>
            Home
          </NavLink>

          <NavLink to="/events" className={navItemClass}>
            Events
          </NavLink>

          <NavLink to="/gallery" className={navItemClass}>
            Gallery
          </NavLink>

          <NavLink to="/products" className={navItemClass}>
            Products
          </NavLink>

          <NavLink to="/contact" className={navItemClass}>
            Contact
          </NavLink>

        </div>

        <NavLink
          to="/signin"
          className="font-body hidden rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-600 md:block"
        >
          Sign In
        </NavLink>

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
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <NavLink to="/" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Home</NavLink>
            <NavLink to="/events" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Events</NavLink>
            <NavLink to="/gallery" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Gallery</NavLink>
            <NavLink to="/products" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Products</NavLink>
            <NavLink to="/contact" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Contact</NavLink>
            <NavLink to="/signin" onClick={closeMobileMenu} className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-slate-900">Sign In</NavLink>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

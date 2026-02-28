import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-[80px] flex items-center justify-between">

        {/* LOGO + BRAND */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Asquare Events"
            className="h-10 w-auto"
          />
          <span className="
            font-heading
            text-lg md:text-xl
            font-semibold
            tracking-widest
            text-slate-900
          ">
            ASQUARE EVENTS
          </span>
        </NavLink>

        {/* NAV LINKS */}
        <div className="hidden md:flex gap-8 font-body text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600"
                : "text-slate-600 hover:text-slate-900 transition"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600"
                : "text-slate-600 hover:text-slate-900 transition"
            }
          >
            Events
          </NavLink>

          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600"
                : "text-slate-600 hover:text-slate-900 transition"
            }
          >
            Gallery
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600"
                : "text-slate-600 hover:text-slate-900 transition"
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600"
                : "text-slate-600 hover:text-slate-900 transition"
            }
          >
            Contact
          </NavLink>

        </div>

        <NavLink
          to="/signin"
          className="font-body rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-600"
        >
          Sign In
        </NavLink>
      </div>
    </nav>
  );
}

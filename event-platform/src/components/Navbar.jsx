import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0f0c29] border-b border-white/10">
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
            text-white
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
                ? "text-pink-400"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive
                ? "text-pink-400"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Events
          </NavLink>

          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              isActive
                ? "text-pink-400"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Gallery
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-pink-400"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Contact
          </NavLink>
        </div>

        {/* CTA */}
        <button className="
          font-body
          text-sm font-medium
          px-5 py-2.5 rounded-xl
          text-white
          border border-white/40
          hover:border-pink-400
          hover:text-pink-300
          transition-all
        ">
          Host Event
        </button>
      </div>
    </nav>
  );
}

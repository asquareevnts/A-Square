import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiUser, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getAuthEventName, isAdminAuthenticated } from "../utils/adminAuth";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [isAdminSession, setIsAdminSession] = useState(() => isAdminAuthenticated());
  const isSignedIn = Boolean(user) || isAdminSession;
  const profileName = user?.fullName || user?.name || user?.email || (isSignedIn ? "Admin" : "");

  useEffect(() => {
    const syncAdminSession = () => {
      setIsAdminSession(isAdminAuthenticated());
    };

    const authEvent = getAuthEventName();
    window.addEventListener(authEvent, syncAdminSession);
    window.addEventListener("storage", syncAdminSession);

    return () => {
      window.removeEventListener(authEvent, syncAdminSession);
      window.removeEventListener("storage", syncAdminSession);
    };
  }, []);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  const navItemClass = ({ isActive }) =>
    isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900 transition";

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
          <img src={logo} alt="Asquare Events" className="h-10 w-auto" />
          <span className="font-heading text-sm font-semibold tracking-wide text-slate-900 sm:text-base sm:tracking-widest md:text-xl">
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

        {!isSignedIn ? (
          <div className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/signin"
              className="font-body rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-600"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className="font-body rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700"
            >
              Sign Up
            </NavLink>
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            {isAdminSession ? (
              <NavLink
                to="/admin"
                className="rounded-xl border border-indigo-300 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-50"
              >
                Admin
              </NavLink>
            ) : null}
            <NavLink
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-600"
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
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <NavLink to="/" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Home</NavLink>
            <NavLink to="/events" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Events</NavLink>
            <NavLink to="/gallery" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Gallery</NavLink>
            <NavLink to="/products" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Products</NavLink>
            <NavLink to="/contact" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Contact</NavLink>
            {!isSignedIn ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <NavLink to="/signin" onClick={closeMobileMenu} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-slate-900">Sign In</NavLink>
                <NavLink to="/signup" onClick={closeMobileMenu} className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-white">Sign Up</NavLink>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {isAdminSession ? (
                  <NavLink
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-indigo-300 px-3 py-2 text-center text-indigo-700"
                  >
                    Admin
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

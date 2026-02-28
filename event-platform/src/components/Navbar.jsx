import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

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

        {/* AUTH BUTTONS / USER MENU */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-600"
              >
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.fullName}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <FiUser className="w-4 h-4" />
                )}
                <span className="hidden md:inline">{user.fullName || user.email}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <FiSettings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink
                to="/signin"
                className="font-body rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-600"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="font-body rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700 shadow-md"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

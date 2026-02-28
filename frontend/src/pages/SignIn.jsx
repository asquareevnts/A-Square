import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  clearAdminSession,
  isAdminAuthenticated,
  setAdminAuthenticated
} from "../utils/adminAuth";
import { loginLocalAccount } from "../data/localAuthStore";
import { buildApiUrl } from "../config/api";

export default function SignIn() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const alreadyAuthed = isAdminAuthenticated();

  useEffect(() => {
    if (alreadyAuthed) {
      navigate("/admin");
    }
  }, [alreadyAuthed, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (identifier === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      await logout();
      setAdminAuthenticated(true);
      navigate("/admin");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: identifier, password })
      });

      const data = await response.json();

      if (data.success) {
        clearAdminSession();
        login(data.user);
        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      const localResult = loginLocalAccount({ identifier, password });
      if (localResult.success) {
        clearAdminSession();
        login(localResult.user);
        navigate("/");
      } else {
        setError("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = buildApiUrl("/auth/google");
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 sm:text-4xl">Welcome Back</h1>
          <p className="text-slate-600">Sign in to continue to ASquare Events</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-indigo-500 hover:bg-slate-50"
          >
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-300"></div>
            <span className="text-sm text-slate-500">or sign in with email</span>
            <div className="h-px flex-1 bg-slate-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">Admin login: admin / admin@123</p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  isAdminAuthenticated,
  setAdminAuthenticated
} from "../utils/adminAuth";

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const alreadyAuthed = isAdminAuthenticated();

  useEffect(() => {
    if (alreadyAuthed) {
      navigate("/admin");
    }
  }, [alreadyAuthed, navigate]);

  function handleSubmit(event) {
    event.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setError("");
      navigate("/admin");
      return;
    }

    setError("Invalid username or password");
  }

  if (alreadyAuthed) {
    return null;
  }

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">Only admin can access dashboard management.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800">
            Sign In
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">Admin credentials: admin / admin@123</p>
      </div>
    </section>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  setAdminAuthenticated
} from "../utils/adminAuth";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check for admin credentials first
    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      navigate("/admin");
      setLoading(false);
      return;
    }

    // Regular user login
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        login(data.user);
        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
<<<<<<< HEAD
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">Only admin can access dashboard management.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800">
            Sign In
=======
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 pb-20 pt-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Sign in to continue to ASquare Events</p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-indigo-500 hover:bg-slate-50"
          >
            <FcGoogle className="text-2xl" />
            Continue with Google
>>>>>>> origin/Sushmitha
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-slate-300"></div>
            <span className="text-sm text-slate-500">or sign in with email</span>
            <div className="h-px flex-1 bg-slate-300"></div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 pl-11 pr-12 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Admin Info */}
          <p className="mt-4 text-xs text-center text-slate-500">
            Admin login: admin / admin@123
          </p>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from "react-icons/fi";
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

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: token + password
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (data.success) {
        setResetMessage(data.message);
        setResetStep(2);
        // In development, if token is returned, show it
        if (data.resetToken) {
          setResetMessage(`${data.message} ${data.resetToken}`);
        }
      } else {
        setResetError(data.message || "Failed to send reset code");
      }
    } catch (err) {
      setResetError("Unable to connect to server. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setResetMessage(data.message);
        setTimeout(() => {
          setShowForgotPassword(false);
          resetForgotPasswordForm();
        }, 2000);
      } else {
        setResetError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setResetError("Unable to connect to server. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const resetForgotPasswordForm = () => {
    setResetEmail("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setResetStep(1);
    setResetMessage("");
    setResetError("");
    setResetLoading(false);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    resetForgotPasswordForm();
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
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                >
                  Forgot Password?
                </button>
              </div>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={handleCloseForgotPassword}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <FiX className="text-2xl" />
            </button>

            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              {resetStep === 1 ? "Forgot Password?" : "Reset Password"}
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              {resetStep === 1
                ? "Enter your email address and we'll send you a reset code."
                : "Enter the code we sent to your email and your new password."}
            </p>

            {resetStep === 1 ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                {resetMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {resetMessage}
                  </div>
                )}

                {resetError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reset Code (6 digits)
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-300 py-3 px-4 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    maxLength="6"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                {resetMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {resetMessage}
                  </div>
                )}

                {resetError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

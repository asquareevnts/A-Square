import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiPhone } from "react-icons/fi";
import { buildApiUrl } from "../config/api";

export default function SignIn() {
  const OTP_RESEND_COOLDOWN_SECONDS = 45;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { login, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginMethod, setLoginMethod] = useState("email");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" && redirectTo === "/" ? "/admin" : redirectTo);
    }
  }, [navigate, redirectTo, user]);

  useEffect(() => {
    const urlResetToken = searchParams.get("resetToken");
    if (urlResetToken) {
      setShowForgotPassword(true);
      setResetStep(2);
      setResetToken(urlResetToken);
    }
  }, [searchParams]);

  useEffect(() => {
    if (otpCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setOtpCooldown((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCooldown]);

  const resetOtpFlow = () => {
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setOtpMessage("");
    setOtpLoading(false);
    setOtpCooldown(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Login failed");
      }

      login(data.user);
      navigate(data.user?.role === "admin" && redirectTo === "/" ? "/admin" : redirectTo);
    } catch (err) {
      setError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    setError("");
    setOtpMessage("");

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch(buildApiUrl("/auth/request-phone-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setOtp("");
      setOtpCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setOtpMessage(data?.otp ? `${data.message} ${data.otp}` : data.message || "OTP sent");
    } catch (requestError) {
      setError(requestError.message || "Unable to send OTP right now.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePhoneOtpLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/verify-phone-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "OTP verification failed");
      }

      login(data.user);
      navigate(data.user?.role === "admin" && redirectTo === "/" ? "/admin" : redirectTo);
    } catch (verifyError) {
      setError(verifyError.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const url = new URL(buildApiUrl("/auth/google"), window.location.origin);
    if (redirectTo && redirectTo !== "/") {
      url.searchParams.set("state", btoa(redirectTo));
    }
    window.location.href = url.toString();
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to send reset code");
      }

      setResetMessage(data.resetToken ? `${data.message} ${data.resetToken}` : data.message);
      setResetStep(2);
    } catch (err) {
      setResetError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();
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
      const response = await fetch(buildApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to reset password");
      }

      setResetMessage(data.message);
      setTimeout(() => {
        setShowForgotPassword(false);
        resetForgotPasswordForm();
      }, 1500);
    } catch (err) {
      setResetError(err.message || "Unable to connect to server. Please try again.");
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
    <section className="min-h-screen bg-gradient-to-br from-[#111325] via-[#0d1020] to-[#1a1e37] px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
        <aside className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl md:flex md:flex-col md:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200">
              ASquare Events
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
              Sign in and manage bookings faster
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Access your profile, track enquiries, and get instant quote updates for your products and events.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">What you get after login</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Real-time quote request updates</li>
              <li>Faster checkout and contact auto-fill</li>
              <li>Admin dashboard access for managers</li>
            </ul>
          </div>
        </aside>

        <div>
          <div className="mb-6 text-center md:text-left">
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Welcome Back</h1>
            <p className="text-slate-300">Sign in to continue to ASquare Events</p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
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
            <span className="text-sm text-slate-500">or choose login method</span>
            <div className="h-px flex-1 bg-slate-300"></div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("email");
                setError("");
                resetOtpFlow();
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                loginMethod === "email"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Email + Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("phone");
                setError("");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                loginMethod === "phone"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Phone + OTP
            </button>
          </div>

          {loginMethod === "email" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
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
                    onChange={(event) => setPassword(event.target.value)}
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

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneOtpLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestPhoneOtp}
                disabled={otpLoading || otpCooldown > 0}
                className="w-full rounded-xl border-2 border-indigo-300 px-4 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading
                  ? "Sending OTP..."
                  : otpCooldown > 0
                    ? `Resend OTP in ${otpCooldown}s`
                    : otpSent
                      ? "Resend OTP"
                      : "Send OTP"}
              </button>

              {otpSent ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-300 py-3 px-4 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    maxLength="6"
                    required
                  />
                </div>
              ) : null}

              {otpMessage ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {otpMessage}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || !otpSent || otp.length !== 6}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying OTP..." : "Login with OTP"}
              </button>
            </form>
          )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-orange-300 hover:text-orange-200">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {showForgotPassword ? (
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(event) => setResetEmail(event.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                {resetMessage ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {resetMessage}
                  </div>
                ) : null}

                {resetError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {resetError}
                  </div>
                ) : null}

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
                  <label className="mb-2 block text-sm font-medium text-slate-700">Reset Code (6 digits)</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    maxLength="6"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                {resetMessage ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {resetMessage}
                  </div>
                ) : null}

                {resetError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {resetError}
                  </div>
                ) : null}

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
      ) : null}
    </section>
  );
}

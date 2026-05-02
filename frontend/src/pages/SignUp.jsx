import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from "react-icons/fi";
import { buildApiUrl } from "../config/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        login(data.user);
        navigate(data.user?.role === "admin" && redirectTo === "/" ? "/admin" : redirectTo);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Unable to create account right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    const url = new URL(buildApiUrl("/auth/google"), window.location.origin);
    if (redirectTo && redirectTo !== "/") {
      url.searchParams.set("state", btoa(redirectTo));
    }
    window.location.href = url.toString();
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#111325] via-[#0d1020] to-[#1a1e37] px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
        <aside className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl md:flex md:flex-col md:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200">
              Join ASquare Events
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
              Create your account in under a minute
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Get faster checkout, booking updates, saved details, and seamless event enquiries from one dashboard.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Why sign up?</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Track your product quote requests</li>
              <li>Book event services quickly</li>
              <li>Manage your profile and contact info</li>
            </ul>
          </div>
        </aside>

        <div>
          <div className="mb-6 text-center md:text-left">
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Create Account</h1>
            <p className="text-slate-300">Join us for amazing events and experiences</p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
            <button
              onClick={handleGoogleSignUp}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-indigo-500 hover:bg-slate-50"
            >
              <FcGoogle className="text-2xl" />
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-300"></div>
              <span className="text-sm text-slate-500">or sign up with email</span>
              <div className="h-px flex-1 bg-slate-300"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone Number <span className="text-slate-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

                {formData.password ? (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full transition-all ${getStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">{getStrengthText()}</span>
                    </div>
                    <p className="text-xs text-slate-500">Use 8+ characters with letters, numbers and symbols</p>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
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
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-indigo-500/30"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              By signing up, you agree to the service terms and privacy policy shared by ASquare Events.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-300">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-orange-300 hover:text-orange-200">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

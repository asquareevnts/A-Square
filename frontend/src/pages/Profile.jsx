import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl } from "../config/api";

export default function Profile() {
  const navigate = useNavigate();
  const { login, logout, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [profile, setProfile] = useState(() => ({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || ""
  }));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    setProfile({
      fullName: user.fullName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || ""
    });
  }, [navigate, user]);

  function handleChange(key, value) {
    setSaved(false);
    setError("");
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(buildApiUrl("/auth/me"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address
        })
      });

      const data = await response.json();
      if (!response.ok || !data?.user) {
        throw new Error(data?.message || "Failed to update profile");
      }

      login(data.user);
      setProfile({
        fullName: data.user.fullName || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: data.user.address || ""
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await logout();
    navigate("/signin");
  }

  if (!user) {
    return null;
  }

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="mt-2 text-slate-600">View and update your account details.</p>

        <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={profile.fullName || ""}
              onChange={(event) => handleChange("fullName", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              value={profile.email || ""}
              readOnly
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
            <input
              value={profile.phone || ""}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              placeholder="+91 90000 00000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <input
              value={profile.address || ""}
              onChange={(event) => handleChange("address", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              placeholder="Your address"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex flex-wrap gap-3">
              <button
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  ⚙ Admin Dashboard
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            {saved ? <p className="mt-3 text-sm text-emerald-600">Profile saved successfully.</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}

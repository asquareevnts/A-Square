import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearAdminSession, isAdminAuthenticated } from "../utils/adminAuth";
import { loadProfileDetails, saveProfileDetails } from "../data/profileStore";

export default function Profile() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isAdmin = isAdminAuthenticated() && !user;
  const isSignedIn = Boolean(user) || isAdmin;

  const identityKey = useMemo(() => {
    if (user?.email) {
      return user.email;
    }
    if (isAdmin) {
      return "admin";
    }
    return "guest";
  }, [isAdmin, user]);

  const defaultProfile = useMemo(
    () => ({
      fullName: user?.fullName || user?.name || (isAdmin ? "Admin User" : ""),
      email: user?.email || (isAdmin ? "admin@asquareevents.com" : ""),
      phone: user?.phone || "",
      address: user?.address || ""
    }),
    [isAdmin, user]
  );

  const [profile, setProfile] = useState(() => loadProfileDetails(identityKey, defaultProfile));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/signin");
      return;
    }

    setProfile(loadProfileDetails(identityKey, defaultProfile));
  }, [defaultProfile, identityKey, isSignedIn, navigate]);

  function handleChange(key, value) {
    setSaved(false);
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    saveProfileDetails(identityKey, profile);
    setSaved(true);
  }

  async function handleSignOut() {
    if (user) {
      await logout();
    }

    clearAdminSession();
    navigate("/signin");
  }

  if (!isSignedIn) {
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
              onChange={(event) => handleChange("email", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
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
              <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save Profile
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="rounded-xl border border-indigo-300 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Go to Admin Dashboard
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
            {saved ? <p className="mt-3 text-sm text-emerald-600">Profile saved successfully.</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}

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

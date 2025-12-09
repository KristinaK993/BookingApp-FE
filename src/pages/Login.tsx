import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Inloggningen misslyckades.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur border border-slate-200 shadow-xl rounded-2xl px-8 py-6 space-y-6"
        >
          {/* Logo + titel */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <CalendarCheck className="h-7 w-7 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              BookingBase
            </h2>

            <p className="text-sm text-slate-500">
              Logga in för att fortsätta.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                className="block mb-1 text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                E-post
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                className="block mb-1 text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Lösenord
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-md bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Loggar in…" : "Logga in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Har du inget konto?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Skapa konto
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

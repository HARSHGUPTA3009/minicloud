import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { Zap } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await authApi.login(form.email, form.password)
          : await authApi.register(form.email, form.password, form.name);
      localStorage.setItem("mc_token", data.token);
      navigate("/");
    } catch (e: any) {
      setError(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-[380px]">

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-sm p-10">

          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-medium text-neutral-900 tracking-tight">MiniCloud</span>
            <div className="w-px h-4 bg-neutral-200" />
            <span className="text-[11px] text-neutral-400 tracking-widest uppercase">PaaS</span>
          </div>

          {/* Mode tabs */}
          <div className="flex border border-neutral-200 rounded-sm overflow-hidden mb-7">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 text-[10px] tracking-[0.6px] uppercase transition-colors ${
                  mode === m
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h1 className="font-serif italic text-[22px] text-neutral-900 leading-tight mb-1">
            {isLogin ? "Welcome back." : "Create account."}
          </h1>
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase mb-7">
            {isLogin ? "Authenticated access only" : "Deploy in minutes"}
          </p>

          {/* Fields */}
          <div className="space-y-4">
            {!isLogin && (
              <Field
                label="Full name"
                type="text"
                value={form.name}
                placeholder="Ada Lovelace"
                onChange={(v) => setForm({ ...form, name: v })}
              />
            )}
            <Field
              label="Email"
              type="email"
              value={form.email}
              placeholder="you@example.com"
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              placeholder="••••••••••••"
              onChange={(v) => setForm({ ...form, password: v })}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full mt-6 py-[11px] bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 text-white text-[11px] tracking-[0.6px] uppercase font-medium transition-colors rounded-sm"
          >
            {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-neutral-400 tracking-wide">
            {isLogin ? "No account? " : "Have an account? "}
            <button
              onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); }}
              className="text-neutral-900 underline underline-offset-2 hover:text-neutral-500 transition-colors"
            >
              {isLogin ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, type, value, placeholder, onChange, onKeyDown,
}: {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-neutral-500 tracking-widest uppercase mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-[10px] text-[13px] font-mono text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
      />
    </div>
  );
}
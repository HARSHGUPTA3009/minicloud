import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { Zap } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login"|"register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const data = mode === "login" ? await authApi.login(form.email, form.password) : await authApi.register(form.email, form.password, form.name);
      localStorage.setItem("mc_token", data.token);
      navigate("/");
    } catch (e: any) { setError(e.response?.data?.error || "Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-violet-500/25">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">MiniCloud</span>
        </div>
        <div className="bg-[#0c0c18] border border-white/[0.07] rounded-2xl p-7">
          <h2 className="text-[17px] font-bold text-white mb-0.5">{mode === "login" ? "Welcome back" : "Create account"}</h2>
          <p className="text-[13px] text-white/35 mb-5">{mode === "login" ? "Sign in to your account" : "Start deploying in minutes"}</p>
          <div className="space-y-2.5">
            {mode === "register" && <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-violet-500/40 placeholder:text-white/20" />}
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-violet-500/40 placeholder:text-white/20" />
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Password" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-violet-500/40 placeholder:text-white/20" />
          </div>
          {error && <p className="text-red-400 text-[12px] mt-2.5">{error}</p>}
          <button onClick={submit} disabled={loading} className="w-full mt-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-white text-[13px] font-semibold transition-colors">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <p className="text-center text-white/25 text-[12px] mt-4">
            {mode === "login" ? "No account? " : "Have an account? "}
            <button onClick={()=>setMode(mode==="login"?"register":"login")} className="text-violet-400 hover:text-violet-300 transition-colors">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

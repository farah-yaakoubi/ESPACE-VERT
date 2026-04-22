"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Eye, EyeOff, AlertCircle, Clock } from "lucide-react";
import { adminAuth, tokenStore } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router      = useRouter();
  const searchParams= useSearchParams();
  const reason      = searchParams.get("reason");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(reason === "inactivity" ? "Session expirée pour inactivité." : "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const res = await adminAuth.login(email, password);
      tokenStore.set(res.access_token);
      tokenStore.setRefresh(res.refresh_token);
      tokenStore.setAdmin(res.admin);
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>

      {/* Panel gauche décoratif */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #052e16 0%, #0a3d1e 50%, #166534 100%)" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize:"40px 40px" }} />
        <div style={{ position:"absolute", top:"15%", right:"-15%", width:"50%", aspectRatio:"1", borderRadius:"50%",
          background:"rgba(125,192,64,0.08)", filter:"blur(60px)" }} />
        <div className="relative z-10 max-w-xs text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #16a34a, #7dc040)" }}>
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily:"var(--font-display, Syne)" }}>
            Espace Vert
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Panneau d'administration du Groupe Espace Vert. Accès réservé aux administrateurs autorisés.
          </p>
          <div className="mt-10 space-y-3">
            {["Gestion du catalogue", "CRM & Devis", "Actualités & FAQ", "Audit & Traçabilité"].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/45">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #16a34a, #7dc040)" }}>
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-gray-900 leading-none">Espace Vert</p>
              <p className="text-xs text-gray-400 mt-0.5">Administration</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily:"var(--font-display, Syne)" }}>
            Connexion
          </h2>
          <p className="text-gray-400 text-sm mb-7">Accédez à votre espace de gestion.</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium mb-5">
              {reason === "inactivity" ? <Clock size={16} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />}
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@espacevert.tn" autoComplete="email"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-ev-500 transition-colors bg-white"
                style={{ "--tw-border-opacity":"1" } as any} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-ev-500 transition-colors bg-white pr-12" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm mt-2 transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0a5c2e, #16a34a)", boxShadow: "0 4px 20px rgba(22,163,74,0.35)" }}>
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Accès sécurisé · Session auto-expire après 30min d'inactivité
          </p>
        </div>
      </div>
    </div>
  );
}

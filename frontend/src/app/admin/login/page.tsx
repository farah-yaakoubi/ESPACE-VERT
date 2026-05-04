"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Clock, ArrowRight, Shield, Leaf, Package, BarChart3, Users } from "lucide-react";
import Image from "next/image";
import { adminAuth, tokenStore } from "@/lib/admin-api";

const FEATURES = [
  { icon: Package,   label: "Gestion catalogue & produits" },
  { icon: BarChart3, label: "CRM · Devis · RDV · Messages" },
  { icon: Users,     label: "Actualités, FAQ & Admins"     },
  { icon: Shield,    label: "Audit & traçabilité complète" },
];

export default function AdminLoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const reason       = searchParams.get("reason");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(
    reason === "inactivity" ? "Session expirée pour inactivité." : ""
  );

  useEffect(() => {
    if (tokenStore.get()) router.replace("/admin/dashboard");
  }, [router]);

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
      setError(err.message ?? "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Panel gauche ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#1C2434" }}
      >
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Glow */}
        <div style={{ position:"absolute", top:"20%", left:"-20%", width:"60%", aspectRatio:"1",
          borderRadius:"50%", background:"rgba(60,80,224,0.12)", filter:"blur(70px)" }} />
        <div style={{ position:"absolute", bottom:"15%", right:"-10%", width:"45%", aspectRatio:"1",
          borderRadius:"50%", background:"rgba(16,185,129,0.08)", filter:"blur(60px)" }} />

        {/* Top: logo image */}
        <div className="relative z-10">
          <Image
            src="/logos/LOGO ESPACE VERT.png"
            alt="Espace Vert"
            width={160}
            height={60}
            className="object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-[11px] mt-2 font-medium tracking-widest uppercase"
            style={{ color:"rgba(255,255,255,0.35)" }}>
            Administration
          </p>
        </div>

        {/* Middle: headline + features */}
        <div className="relative z-10">
          <h2 className="text-[32px] font-bold text-white leading-tight mb-4" style={{ letterSpacing:"-0.04em" }}>
            Gérez votre activité<br />en toute simplicité.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color:"rgba(255,255,255,0.45)" }}>
            Interface sécurisée pour les administrateurs du Groupe Espace Vert.
          </p>
          <div className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background:"rgba(60,80,224,0.15)", border:"1px solid rgba(60,80,224,0.3)" }}>
                  <Icon size={14} style={{ color:"#7B8FF0" }} />
                </div>
                <span className="text-[13px]" style={{ color:"rgba(255,255,255,0.5)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: site link */}
        <div className="relative z-10 pt-6" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <a href="/" target="_blank"
            className="inline-flex items-center gap-2 text-xs transition-colors"
            style={{ color:"rgba(255,255,255,0.25)" }}
            onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.25)")}>
            <ArrowRight size={11} /> Voir le site public
          </a>
        </div>
      </div>

      {/* ── Formulaire ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background:"#F1F5F9" }}>
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Image
              src="/images/logos/LOGO ESPACE VERT.png"
              alt="Espace Vert"
              width={120}
              height={45}
              className="object-contain"
            />
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border:"1px solid #E2E8F0" }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ letterSpacing:"-0.04em" }}>
                Connexion
              </h1>
              <p className="text-sm text-gray-400">Accédez à votre espace d&apos;administration.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium mb-6"
                style={{ background: reason === "inactivity" ? "#FFFBEB" : "#FEF2F2",
                         border: `1px solid ${reason === "inactivity" ? "#FDE68A" : "#FECACA"}`,
                         color: reason === "inactivity" ? "#92400E" : "#B91C1C" }}>
                {reason === "inactivity"
                  ? <Clock size={15} className="shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Adresse e-mail
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@espacevert.tn" autoComplete="email" autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                  style={{ border:"2px solid #E2E8F0", background:"#F8FAFC" }}
                  onFocus={e => { e.currentTarget.style.borderColor="#3C50E0"; e.currentTarget.style.background="#fff"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all pr-11"
                    style={{ border:"2px solid #E2E8F0", background:"#F8FAFC" }}
                    onFocus={e => { e.currentTarget.style.borderColor="#3C50E0"; e.currentTarget.style.background="#fff"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? "#94A3B8" : "linear-gradient(135deg,#3C50E0,#4F60E8)",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(60,80,224,0.35)",
                }}>
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion…
                  </>
                ) : (
                  <>Se connecter <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Shield size={11} className="text-gray-300" />
            <span>Accès sécurisé · Session expire après 30 min d&apos;inactivité</span>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import { adminAuth, tokenStore } from "@/lib/admin-api";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Clock,
  Eye,
  EyeOff,
  Package,
  Shield,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  { icon: Package, label: "Gestion catalogue & produits" },
  { icon: BarChart3, label: "CRM · Devis · RDV · Messages" },
  { icon: Users, label: "Actualités, FAQ & Admins" },
  { icon: Shield, label: "Audit & traçabilité complète" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    reason === "inactivity" ? "Session expirée pour inactivité." : "",
  );
  const [featureIndex, setFeatureIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const featureContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (tokenStore.get()) router.replace("/admin/dashboard");
  }, [router]);

  // Handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setFeatureIndex((prev) => (prev + 1) % FEATURES.length);
    }
    if (isRightSwipe) {
      setFeatureIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
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
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── CSS Animations ───────────────────────────────────────────── */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(63, 152, 70, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(63, 152, 70, 0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .feature-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .feature-card-active {
          animation: scaleIn 0.4s ease-out;
        }
        .input-focus {
          box-shadow: 0 0 0 3px rgba(159, 211, 86, 0.1), inset 0 0 0 2px #3F9846 !important;
        }
      `}</style>

      {/* ── Panel gauche ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0D4A27 0%, #1B6E3A 50%, #2E8B5C 100%)",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow animations */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-20%",
            width: "60%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "rgba(159,211,86,0.12)",
            filter: "blur(70px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "-10%",
            width: "45%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "rgba(159,211,86,0.08)",
            filter: "blur(60px)",
            animation: "float 5s ease-in-out infinite 0.5s",
          }}
        />

        {/* Top: logo image */}
        <div
          className="relative z-10 animate-slideInLeft pb-8"
          style={{
            animationDelay: "0s",
            borderBottom: "1px solid rgba(159,211,86,0.2)",
          }}
        >
          <Image
            src="/logos/logo-espace-vert.png"
            alt="Espace Vert"
            width={1000}
            height={45}
            className="object-contain"
            priority
            style={{ width: "auto", height: "auto", maxWidth: "100%" }}
          />
          <p
            className="text-[10px] mt-2.5 font-medium tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Administration
          </p>
        </div>

        {/* Middle: headline + features carousel */}
        <div className="relative z-10">
          <h2
            className="text-[26px] font-bold text-white leading-tight mb-2 animate-fadeInUp"
            style={{ letterSpacing: "-0.04em", animationDelay: "0.1s" }}
          >
            Gérez votre activité
            <br />
            en toute simplicité.
          </h2>
          <p
            className="text-xs leading-relaxed mb-6 animate-fadeInUp"
            style={{ color: "rgba(255,255,255,0.4)", animationDelay: "0.2s" }}
          >
            Interface sécurisée pour les administrateurs du Groupe Espace Vert.
          </p>

          {/* Features Carousel with Swipe */}
          <div
            ref={featureContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="space-y-2 cursor-grab active:cursor-grabbing select-none"
            style={{ userSelect: "none" }}
          >
            {FEATURES.map(({ icon: Icon, label }, idx) => {
              const isActive = idx === featureIndex;
              const isNext = idx === (featureIndex + 1) % FEATURES.length;
              const isPrev =
                idx === (featureIndex - 1 + FEATURES.length) % FEATURES.length;

              return (
                <div
                  key={label}
                  className="feature-card relative flex items-center gap-2 transition-all duration-300 p-2 rounded-lg"
                  style={{
                    opacity: isActive ? 1 : isPrev || isNext ? 0.3 : 0,
                    transform: isActive
                      ? "scale(1) translateX(0)"
                      : isPrev
                        ? "translateX(-20px)"
                        : "translateX(20px)",
                    pointerEvents: isActive ? "auto" : "none",
                    height: isActive ? "auto" : "0",
                    marginBottom: isActive ? "8px" : "0",
                    background: isActive
                      ? "rgba(159,211,86,0.08)"
                      : "transparent",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 relative"
                    style={{
                      background: "rgba(159,211,86,0.2)",
                      border: "1px solid rgba(159,211,86,0.4)",
                    }}
                  >
                    <Icon size={12} style={{ color: "#9FD356" }} />
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: "rgba(159,211,86,0.25)",
                          animation:
                            "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[11px] transition-all duration-300"
                    style={{
                      color: isActive
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.45)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Feature indicators */}
          <div className="flex gap-1.5 mt-5">
            {FEATURES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setFeatureIndex(idx)}
                className="h-0.5 rounded-full transition-all duration-300 hover:bg-white/40"
                style={{
                  width: idx === featureIndex ? "20px" : "5px",
                  background:
                    idx === featureIndex
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom: site link */}
        <div
          className="relative z-10 pt-6 animate-slideInLeft"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            animationDelay: "0.3s",
          }}
        >
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 text-xs transition-all hover:gap-3"
            style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
            }
          >
            <ArrowRight size={11} /> Voir le site public
          </a>
        </div>
      </div>

      {/* ── Formulaire ───────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: "#F7F9F5" }}
      >
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 animate-fadeInUp">
            <Image
              src="/logos/logo-espace-vert.png"
              alt="Espace Vert"
              width={120}
              height={45}
              className="object-contain"
              priority
              style={{ width: "auto", height: "auto", maxWidth: "100%" }}
            />
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-2xl p-8 shadow-sm animate-scaleIn"
            style={{ border: "1px solid #E2E8F0", animationDelay: "0.2s" }}
          >
            <div
              className="mb-7 animate-fadeInUp"
              style={{ animationDelay: "0.3s" }}
            >
              <h1
                className="text-2xl font-bold text-gray-800 mb-1"
                style={{ letterSpacing: "-0.04em" }}
              >
                Connexion
              </h1>
              <p className="text-sm text-gray-400">
                Accédez à votre espace d&apos;administration.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium mb-6 animate-fadeInUp"
                style={{
                  background: reason === "inactivity" ? "#FFFBEB" : "#FEF2F2",
                  border: `1px solid ${reason === "inactivity" ? "#FDE68A" : "#FECACA"}`,
                  color: reason === "inactivity" ? "#92400E" : "#B91C1C",
                  animationDelay: "0.4s",
                }}
              >
                {reason === "inactivity" ? (
                  <Clock size={15} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                )}
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* Email */}
              <div
                className="animate-fadeInUp"
                style={{ animationDelay: "0.4s" }}
              >
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@espacevert.tn"
                  autoComplete="email"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                  style={{ border: "2px solid #E2E8F0", background: "#F8FAFC" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#3F9846";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(159, 211, 86, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div
                className="animate-fadeInUp"
                style={{ animationDelay: "0.5s" }}
              >
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all pr-11"
                    style={{
                      border: "2px solid #E2E8F0",
                      background: "#F8FAFC",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#3F9846";
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(159, 211, 86, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0";
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors active:scale-90"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed animate-fadeInUp"
                style={{
                  background: loading
                    ? "#94A3B8"
                    : "linear-gradient(135deg,#3F9846,#5CB85C)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 16px rgba(63, 152, 70, 0.35)",
                  animationDelay: "0.6s",
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion…
                  </>
                ) : (
                  <>
                    Se connecter <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div
            className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 animate-fadeInUp"
            style={{ animationDelay: "0.7s" }}
          >
            <Shield size={11} className="text-gray-300" />
            <span>
              Accès sécurisé · Session expire après 30 min d&apos;inactivité
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { safeNextPath } from "@/lib/auth/safe-next";

interface AuthSliderProps {
  initialMode?: "login" | "register";
}

/** Error message inside the auth card */
function FormError({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2"
    >
      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function AuthSlider({ initialMode = "login" }: AuthSliderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode");

  const [mode, setMode] = useState<"login" | "register">(
    queryMode === "register" || initialMode === "register" ? "register" : "login"
  );

  const { user, login, register, logout, isLoading, error: authError } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  const handleSwitchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setLoginError(null);
    setRegError(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = newMode === "login" ? "/login" : "/register";
      url.searchParams.delete("mode");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError("Email dan password wajib diisi.");
      return;
    }

    setIsLoginSubmitting(true);
    const success = await login(loginEmail, loginPassword);
    setIsLoginSubmitting(false);

    if (success) {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            router.push(safeNextPath(searchParams.get("next")));
            return;
          }
        }
      } catch {
        // Fallback to onboarding
      }
      router.push("/onboarding");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError("Semua kolom pendaftaran wajib diisi.");
      return;
    }

    if (regPassword.length < 8) {
      setRegError("Password minimal 8 karakter.");
      return;
    }

    setIsRegSubmitting(true);
    const success = await register(regEmail, regPassword, regName);
    setIsRegSubmitting(false);

    if (success) {
      router.push("/onboarding");
    }
  };

  // If user is already logged in
  if (user) {
    return (
      <div className="min-h-screen bg-[#eaf0fd] dark:bg-[#050813] text-slate-900 dark:text-slate-100 flex flex-col justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(37,99,235,0.25)_0%,rgba(30,58,138,0.12)_40%,transparent_75%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(59,130,246,0.25)_0%,rgba(30,58,138,0.12)_40%,transparent_75%)] pointer-events-none" />
        </div>

        <section
          aria-labelledby="akun-title"
          className="relative z-10 max-w-md w-full mx-auto rounded-3xl bg-white/85 dark:bg-[#080D1A]/95 border border-slate-200/80 dark:border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl glass-sheen group overflow-hidden"
        >
          {/* Glass specular top highlight */}
          <div
            className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-teal-400/30 to-transparent pointer-events-none z-20"
            aria-hidden="true"
          />
          <div className="relative z-10 space-y-1.5">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Sesi Aktif
            </span>
            <h1 id="akun-title" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
              {user.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 break-words">{user.email}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full min-h-12 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center transition-all"
            >
              Buka Beranda
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full min-h-12 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Keluar Akun
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf0fd] dark:bg-[#050813] text-slate-900 dark:text-slate-100 relative selection:bg-teal-600 selection:text-white overflow-hidden px-4 sm:px-6 py-8 sm:py-14 flex flex-col justify-center">
      {/* Background Decor System */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(20,184,166,0.35)_0%,rgba(13,148,136,0.15)_40%,transparent_75%)] dark:bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(20,184,166,0.35)_0%,rgba(13,148,136,0.15)_40%,transparent_75%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(45,212,191,0.22)_0%,rgba(20,184,166,0.08)_45%,transparent_70%)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto space-y-5">
        {/* Header navigation */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-md transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Beranda
          </Link>
          <ThemeToggle />
        </div>

        {/* Main Card */}
        <section
          aria-label={mode === "login" ? "Masuk" : "Daftar"}
          className="relative rounded-3xl bg-white/85 dark:bg-[#080D1A]/95 border border-slate-200/80 dark:border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden transition-card glass-sheen group"
        >
          {/* Glass specular top highlight like dashboard cards */}
          <div
            className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-teal-400/30 to-transparent pointer-events-none z-20"
            aria-hidden="true"
          />
          {/* Subtle ambient lighting inside the glass */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-28 bg-teal-500/10 dark:bg-teal-400/10 blur-2xl pointer-events-none rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 px-6 sm:px-8 pt-7 pb-4 space-y-5">
            <div className="flex items-center justify-center">
              <Link href="/" className="inline-block" aria-label="Finoch.id Beranda">
                <BrandLogo variant="full" className="h-6 w-auto" />
              </Link>
            </div>

            {/* Segmented Pill Tab Switcher */}
            <div className="relative p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center">
              <span
                aria-hidden="true"
                className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-teal-600 shadow-md shadow-teal-500/25 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mode === "login" ? "left-1" : "left-[calc(50%+2px)]"
                }`}
              />
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => handleSwitchMode("login")}
                className={`relative z-10 flex-1 min-h-10 text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                  mode === "login"
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                aria-pressed={mode === "register"}
                onClick={() => handleSwitchMode("register")}
                className={`relative z-10 flex-1 min-h-10 text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                  mode === "register"
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Daftar
              </button>
            </div>
          </div>

          {/* Sliding track with consistent height */}
          <div className="relative z-10 overflow-hidden w-full">
            <div
              className={`flex items-stretch w-[200%] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mode === "login" ? "translate-x-0" : "-translate-x-1/2"
              }`}
            >
              {/* Login Panel */}
              <div
                inert={mode !== "login"}
                className="w-1/2 shrink-0 px-6 sm:px-8 pt-1 pb-7 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Masuk ke Akunmu
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Lanjut nyatat dari terakhir kali secara instan.
                    </p>
                  </div>

                  {(loginError || (mode === "login" && authError)) && (
                    <FormError>{loginError || authError}</FormError>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5" noValidate>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="login-email"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full min-h-11 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full min-h-11 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 pl-3.5 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          aria-label={showLoginPassword ? "Sembunyikan password" : "Lihat password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoginSubmitting || isLoading}
                      className="w-full min-h-11 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isLoginSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-label="Memproses" />
                      ) : (
                        "Masuk"
                      )}
                    </button>
                  </form>
                </div>

                {/* Demo Credentials Section (Teks Simpel Tanpa Card) */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Kredensial Akun Demo</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("demo@finoch.id");
                        setLoginPassword("demo123456");
                        setLoginError(null);
                      }}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Isi Otomatis
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Email: </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 select-all font-medium">
                        demo@finoch.id
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Password: </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 select-all font-medium">
                        demo123456
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                    Gunakan akun demo untuk melihat simulasi data transaksi &amp; fitur FinBot tanpa daftar.
                  </p>
                </div>

                <p className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-center text-slate-500 dark:text-slate-400">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("register")}
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Daftar gratis
                  </button>
                </p>
              </div>

              {/* Register Panel */}
              <div
                inert={mode !== "register"}
                className="w-1/2 shrink-0 px-6 sm:px-8 pt-1 pb-7 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Bikin Akun Baru
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Gratis. Langsung kelola jatah uang sakumu.
                    </p>
                  </div>

                  {(regError || (mode === "register" && authError)) && (
                    <FormError>{regError || authError}</FormError>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-name"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Nama
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        autoComplete="name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Budi Santoso"
                        className="w-full min-h-11 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-email"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Email
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full min-h-11 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          autoComplete="new-password"
                          aria-describedby="reg-password-hint"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full min-h-11 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 pl-3.5 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          aria-label={showRegPassword ? "Sembunyikan password" : "Lihat password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      <p id="reg-password-hint" className="text-[11px] text-slate-500 dark:text-slate-400">
                        Minimal 8 karakter.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegSubmitting || isLoading}
                      className="w-full min-h-11 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isRegSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-label="Memproses" />
                      ) : (
                        "Daftar"
                      )}
                    </button>
                  </form>
                </div>

                {/* Info Akun Demo di Register - Teks simpel */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Ingin coba tanpa daftar?</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchMode("login");
                        setLoginEmail("demo@finoch.id");
                        setLoginPassword("demo123456");
                        setLoginError(null);
                      }}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Gunakan Akun Demo
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                    Tersedia akun demo siap pakai dengan riwayat transaksi lengkap untuk eksplorasi.
                  </p>
                </div>

                <p className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-center text-slate-500 dark:text-slate-400">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("login")}
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Masuk
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

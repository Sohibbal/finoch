"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Mail, User, Loader2, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AuthSliderProps {
  initialMode?: "login" | "register";
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("voicash_theme", "dark");
      localStorage.setItem("finra_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("voicash_theme", "light");
      localStorage.setItem("finra_theme", "light");
    }
  };

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
            router.push("/dashboard");
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

    if (regPassword.length < 6) {
      setRegError("Password minimal 6 karakter.");
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
      <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col justify-center px-4 sm:px-6 py-12 transition-colors">
        <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-cream-200 dark:bg-navy-900 text-navy-950 dark:text-cream-100 flex items-center justify-center mx-auto font-black text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950 dark:text-cream-50">
              {user.name}
            </h2>
            <p className="text-xs text-navy-600 dark:text-cream-300/70">{user.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-cream-100 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800 text-xs text-navy-700 dark:text-cream-200">
            Akun Anda aktif dan siap digunakan untuk pencatatan transaksi harian.
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition-all shadow-sm"
            >
              Buka Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-navy-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col justify-center px-4 sm:px-6 py-10 transition-colors selection:bg-navy-900 selection:text-cream-100 dark:selection:bg-cream-100 dark:selection:text-navy-950">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Top Bar with Back and Theme Toggle */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-700 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
            className="p-1.5 rounded-lg text-navy-700 hover:text-navy-950 dark:text-cream-300 dark:hover:text-cream-50 hover:bg-cream-200/60 dark:hover:bg-navy-800/80 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-cream-200" />
            ) : (
              <Moon className="w-4 h-4 text-navy-900" />
            )}
          </button>
        </div>

        {/* Main Sliding Card */}
        <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-xl overflow-hidden transition-colors">
          {/* Brand & Sliding Segmented Tab */}
          <div className="p-6 sm:p-7 pb-4 border-b border-cream-200 dark:border-navy-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-tight text-navy-950 dark:text-cream-50">
                voicash<span className="text-navy-600 dark:text-cream-300">.id</span>
              </span>
              <span className="text-[11px] font-medium text-navy-500 dark:text-cream-400">
                {mode === "login" ? "Akses Akun" : "Registrasi Akun"}
              </span>
            </div>

            {/* Smooth Segmented Slider Controller */}
            <div className="relative p-1 rounded-full bg-cream-100 dark:bg-navy-900 border border-cream-200 dark:border-navy-800 flex items-center">
              {/* Sliding Pill Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-navy-900 dark:bg-cream-100 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mode === "login" ? "left-1" : "left-[calc(50%+2px)]"
                }`}
              />

              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                className={`relative z-10 w-1/2 py-2 text-xs font-bold text-center transition-colors duration-200 ${
                  mode === "login"
                    ? "text-cream-50 dark:text-navy-950"
                    : "text-navy-700 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
                }`}
              >
                Masuk
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("register")}
                className={`relative z-10 w-1/2 py-2 text-xs font-bold text-center transition-colors duration-200 ${
                  mode === "register"
                    ? "text-cream-50 dark:text-navy-950"
                    : "text-navy-700 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
                }`}
              >
                Daftar
              </button>
            </div>
          </div>

          {/* Sliding Content Track */}
          <div className="relative overflow-hidden w-full">
            <div
              className={`flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mode === "login" ? "translate-x-0" : "-translate-x-1/2"
              }`}
            >
              {/* PANEL 1: LOGIN (w-1/2) */}
              <div className="w-1/2 p-6 sm:p-7 pt-5 space-y-5 shrink-0">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-950 dark:text-cream-50">
                    Masuk ke akun
                  </h1>
                  <p className="text-xs text-navy-600 dark:text-cream-300/70">
                    Lanjutkan pencatatan pengeluaran harian Anda
                  </p>
                </div>

                {(loginError || (mode === "login" && authError)) && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium animate-fade-in">
                    {loginError || authError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 placeholder-navy-400 dark:placeholder-cream-400/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                      />
                      <Mail className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 placeholder-navy-400 dark:placeholder-cream-400/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                      />
                      <Lock className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoginSubmitting || isLoading}
                    className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 disabled:opacity-50 text-cream-50 dark:text-navy-950 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    {isLoginSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Masuk Sekarang"
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-navy-600 dark:text-cream-300/70 border-t border-cream-200 dark:border-navy-800">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("register")}
                    className="text-navy-950 dark:text-cream-100 font-bold hover:underline"
                  >
                    Daftar di sini &rarr;
                  </button>
                </div>
              </div>

              {/* PANEL 2: REGISTER (w-1/2) */}
              <div className="w-1/2 p-6 sm:p-7 pt-5 space-y-5 shrink-0">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-950 dark:text-cream-50">
                    Buat akun baru
                  </h1>
                  <p className="text-xs text-navy-600 dark:text-cream-300/70">
                    Daftar gratis dalam 30 detik untuk mulai mencatat
                  </p>
                </div>

                {(regError || (mode === "register" && authError)) && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium animate-fade-in">
                    {regError || authError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Budi Santoso"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 placeholder-navy-400 dark:placeholder-cream-400/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                      />
                      <User className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 placeholder-navy-400 dark:placeholder-cream-400/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                      />
                      <Mail className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Password (minimal 6 karakter)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 placeholder-navy-400 dark:placeholder-cream-400/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                      />
                      <Lock className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegSubmitting || isLoading}
                    className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 disabled:opacity-50 text-cream-50 dark:text-navy-950 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    {isRegSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Daftar Akun Sekarang"
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-navy-600 dark:text-cream-300/70 border-t border-cream-200 dark:border-navy-800">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("login")}
                    className="text-navy-950 dark:text-cream-100 font-bold hover:underline"
                  >
                    &larr; Masuk di sini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

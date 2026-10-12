"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Note } from "@/components/press/note";
import { useAuth } from "@/hooks/use-auth";
import { safeNextPath } from "@/lib/auth/safe-next";

interface AuthSliderProps {
  initialMode?: "login" | "register";
}

const FIELD =
  "w-full min-h-12 bg-paper border border-ink/30 px-3 text-body text-ink placeholder:text-ink-soft focus:outline-none focus-visible:border-ink";
const LABEL = "block text-body font-semibold text-ink mb-1.5";
const SUBMIT =
  "w-full min-h-12 rounded-full bg-ink text-paper-sheet dark:text-paper text-body font-bold hover:bg-ink/90 disabled:opacity-50 flex items-center justify-center gap-2";
const SWITCH_LINK = "min-h-11 font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink";

/** An error printed on the sheet: outlined in red, announced right away. */
function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="border border-habis px-3 py-2.5 text-body font-semibold text-habis-ink">
      {children}
    </p>
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
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
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-center px-4 sm:px-6 py-12">
        <Note as="section" aria-labelledby="akun-title" className="max-w-md w-full mx-auto px-6 sm:px-8 py-8 space-y-5">
          <div className="space-y-1">
            <p className="text-body text-ink-soft">Kamu sudah masuk sebagai</p>
            <h1 id="akun-title" className="font-display text-head font-bold text-ink break-words">
              {user.name}
            </h1>
            <p className="text-body text-ink-soft break-words">{user.email}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link href="/dashboard" className={SUBMIT}>
              Buka Beranda
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full min-h-12 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Keluar akun
            </button>
          </div>
        </Note>
      </div>
    );
  }

  const tab = (value: "login" | "register", label: string) => (
    <button
      type="button"
      aria-pressed={mode === value}
      onClick={() => handleSwitchMode(value)}
      className={`relative z-10 flex-1 min-h-11 text-body font-bold motion-safe:transition-colors motion-safe:duration-200 ${
        mode === value ? "text-paper-sheet dark:text-paper" : "text-ink hover:bg-ink/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-paper text-ink px-4 sm:px-6 py-6 sm:py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 min-h-11 text-body font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Beranda
          </Link>
          <ThemeToggle />
        </div>

        <Note as="section" aria-label={mode === "login" ? "Masuk" : "Daftar"} className="overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-4 space-y-5">
            <Link href="/" className="inline-block" aria-label="Finoch.id Beranda">
              <BrandLogo variant="full" className="h-6 w-auto" />
            </Link>

            {/* Two halves of one ticket; the ink block slides to the chosen half. */}
            <div className="relative flex border border-ink">
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-1/2 bg-ink motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mode === "login" ? "translate-x-0" : "translate-x-full"
                }`}
              />
              {tab("login", "Masuk")}
              {tab("register", "Daftar")}
            </div>
          </div>

          {/* Sliding track; the hidden panel is inert so focus never lands off-screen. */}
          <div className="relative overflow-hidden w-full">
            <div
              className={`flex items-start w-[200%] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mode === "login" ? "translate-x-0" : "-translate-x-1/2"
              }`}
            >
              <div inert={mode !== "login"} className={`w-1/2 shrink-0 ${mode !== "login" ? "h-0 overflow-hidden" : ""} px-6 sm:px-8 pt-2 pb-8 space-y-5`}>
                <div className="space-y-1">
                  <h1 className="font-display text-head font-bold text-ink">Masuk ke akunmu</h1>
                  <p className="text-body text-ink-soft">Lanjut nyatat dari terakhir kali.</p>
                </div>

                {(loginError || (mode === "login" && authError)) && <FormError>{loginError || authError}</FormError>}

                <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="login-email" className={LABEL}>
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className={LABEL}>
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={FIELD}
                    />
                  </div>
                  <button type="submit" disabled={isLoginSubmitting || isLoading} className={SUBMIT}>
                    {isLoginSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-label="Memproses" /> : "Masuk"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail("demo@finoch.id");
                      setLoginPassword("demo123456");
                      setLoginError(null);
                    }}
                    className="w-full py-2.5 px-3 text-xs rounded-2xl border border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/30 hover:bg-teal-100/70 dark:hover:bg-teal-900/40 transition-colors flex items-center justify-center gap-1.5 font-semibold cursor-pointer shadow-xs"
                  >
                    <span>Gunakan Akun Demo (Jan - Sep 2026)</span>
                  </button>
                </form>

                <p className="pt-4 border-t border-ink/20 text-body text-ink-soft">
                  Belum punya akun?{" "}
                  <button type="button" onClick={() => handleSwitchMode("register")} className={SWITCH_LINK}>
                    Daftar gratis
                  </button>
                </p>
              </div>

              <div inert={mode !== "register"} className={`w-1/2 shrink-0 ${mode !== "register" ? "h-0 overflow-hidden" : ""} px-6 sm:px-8 pt-2 pb-8 space-y-5`}>
                <div className="space-y-1">
                  <h1 className="font-display text-head font-bold text-ink">Bikin akun baru</h1>
                  <p className="text-body text-ink-soft">Gratis. Habis ini tinggal isi uang bulananmu.</p>
                </div>

                {(regError || (mode === "register" && authError)) && <FormError>{regError || authError}</FormError>}

                <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="reg-name" className={LABEL}>
                      Nama
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Budi Santoso"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-email" className={LABEL}>
                      Email
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-password" className={LABEL}>
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby="reg-password-hint"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={FIELD}
                    />
                    <p id="reg-password-hint" className="mt-1.5 text-meta text-ink-soft">
                      Minimal 8 karakter.
                    </p>
                  </div>
                  <button type="submit" disabled={isRegSubmitting || isLoading} className={SUBMIT}>
                    {isRegSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-label="Memproses" /> : "Daftar"}
                  </button>
                </form>

                <p className="pt-4 border-t border-ink/20 text-body text-ink-soft">
                  Sudah punya akun?{" "}
                  <button type="button" onClick={() => handleSwitchMode("login")} className={SWITCH_LINK}>
                    Masuk
                  </button>
                </p>
              </div>
            </div>
          </div>
        </Note>
      </div>
    </div>
  );
}

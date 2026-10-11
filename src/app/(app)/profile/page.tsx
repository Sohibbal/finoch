"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Moon,
  Shield,
  Bot,
  Save,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthContext } from "@/components/layout/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    // 1. First check local storage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("finoch_user_nickname");
      if (stored) setNickname(stored);
    }

    // 2. Fetch profile from API
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.profile?.nickname) {
            setNickname(data.profile.nickname);
            localStorage.setItem("finoch_user_nickname", data.profile.nickname);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote profile:", err);
      }
    }

    fetchProfile();
  }, []);

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      localStorage.setItem("finoch_user_nickname", cleanNick);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: cleanNick }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan ke server");
      }

      setFeedback({
        type: "success",
        message: "Nama panggilan berhasil disimpan! FinBot & Dashboard akan menyapa lo dengan nama ini.",
      });
    } catch {
      // Even if offline, local storage updated successfully
      setFeedback({
        type: "success",
        message: "Nama panggilan disimpan secara lokal (mode offline).",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah lo yakin ingin keluar dari akun ini?")) {
      await logout();
      router.push("/login");
    }
  };

  return (
    <>
      <PageHeader
        title="Profil"
        subtitle="Kelola nama panggilan lo, akun, dan tampilan aplikasi"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 border ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            )}
            <p className="text-body font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Personal Nickname Setting */}
        <section className="p-6 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-head font-bold text-ink dark:text-white">Nama Panggilan (Nickname)</h3>
              <p className="text-meta text-ink-soft dark:text-navy-400">
                Nama yang digunakan FinBot dan Dashboard untuk menyapa lo
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveNickname} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-meta font-semibold text-ink dark:text-white mb-1.5">
                Panggilan Akrab
              </label>
              <input
                id="nickname"
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Contoh: Alex, Budi, Salsa"
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 dark:border-navy-700 bg-paper dark:bg-navy-950 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !nickname.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 font-semibold text-meta hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan Panggilan"}</span>
            </button>
          </form>
        </section>

        {/* Account Details */}
        <section className="p-6 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-head font-bold text-ink dark:text-white">Informasi Akun</h3>
              <p className="text-meta text-ink-soft dark:text-navy-400">Status autentikasi dan data login</p>
            </div>
          </div>

          <div className="divide-y divide-ink/10 dark:divide-navy-800 text-body">
            <div className="py-3 flex items-center justify-between">
              <span className="text-ink-soft dark:text-navy-400">Email Akun</span>
              <span className="font-semibold text-ink dark:text-white">{user?.email || "Tamu / Offline"}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-ink-soft dark:text-navy-400">Mode Penyimpanan</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Local-First PWA (IndexedDB)</span>
              </span>
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section className="p-6 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-head font-bold text-ink dark:text-white">Tema Tampilan</h3>
                <p className="text-meta text-ink-soft dark:text-navy-400">Ganti tema terang atau gelap</p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </section>

        {/* Logout Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-body transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </>
  );
}

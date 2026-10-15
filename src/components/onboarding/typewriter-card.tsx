"use client";

import React, { useState, useEffect } from "react";
import { Bot, ArrowRight } from "lucide-react";

interface TypewriterCardProps {
  onComplete: (nickname: string) => void;
  isLoading?: boolean;
}

const GREETING_TEXT = "Hai! Kenalin, gue FinBot. Teman finansial lo. Biar kita makin akrab, nama panggilan lo siapa nih?";

export function TypewriterCard({ onComplete, isLoading = false }: TypewriterCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= GREETING_TEXT.length) {
        setDisplayedText(GREETING_TEXT.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("Panggilannya diisi dulu yaa!");
      return;
    }
    if (trimmed.length < 2) {
      setError("Minimal 2 huruf yaa!");
      return;
    }
    setError("");
    onComplete(trimmed);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-paper-sheet dark:bg-navy-900 border border-ink/20 dark:border-navy-700 rounded-2xl shadow-xl transition-all">
      {/* FinBot Mascot / Avatar */}
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Bot className="w-10 h-10 animate-bounce" strokeWidth={2} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink/5 dark:bg-navy-800 text-meta font-semibold text-ink-soft dark:text-navy-200">
          <Bot className="w-3.5 h-3.5 text-amber-500" />
          <span>FinBot AI Copilot</span>
        </div>
      </div>

      {/* Animated Typewriter Speech */}
      <div className="min-h-[4.5rem] mb-6 p-4 rounded-xl bg-paper-deep dark:bg-navy-950/60 border border-ink/10 dark:border-navy-800">
        <p className="text-body font-medium text-ink dark:text-navy-100 leading-relaxed">
          {displayedText}
          <span className="inline-block w-1.5 h-4 ml-1 bg-amber-500 animate-pulse align-middle" />
        </p>
      </div>

      {/* Nickname Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname-input" className="block text-meta font-semibold text-ink-soft dark:text-navy-300 mb-1.5">
            Nama Panggilan
          </label>
          <input
            id="nickname-input"
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError("");
            }}
            placeholder="Contoh: Alex, Daffa, Salsa..."
            disabled={isLoading}
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl border border-ink/30 dark:border-navy-600 bg-paper-sheet dark:bg-navy-800 text-ink dark:text-white placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors text-body"
            autoFocus
          />
          {error && <p className="mt-1.5 text-meta text-rose-500 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-ink dark:bg-white text-paper-sheet dark:text-navy-950 font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <span>{isLoading ? "Menyiapkan..." : "Mulai Berteman"}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  source?: "llm" | "facts_fallback";
  model?: string;
  provider?: string;
  diagnostic?: string | null;
}

export default function CopilotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Halo! Saya Finoch AI Copilot untuk Mahasiswa & Anak Kost. Saya menganalisis kondisi finansial riil kamu berdasarkan catatan pengeluaran dan target tabungan. Mau cek jatah jajan harian, trik hemat anak kost, atau simulasi beli barang impian?",
      timestamp: "Baru saja",
      source: "facts_fallback",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    "Jatah jajan hari ini masih aman nggak?",
    "Gimana trik hemat makan biar uang kiriman cukup sebulan?",
    "Aman nggak kalau beli sepatu/baju baru minggu ini?",
    "Kiat bertahan hidup saat krisis tanggal tua",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi Finoch Copilot");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "copilot",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        source: data.source,
        model: data.model,
        provider: data.provider,
        diagnostic: data.llmDiagnostic,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "copilot",
          text: "Maaf, terjadi kendala saat menganalisis data keuangan Anda. Silakan coba kembali sesaat lagi.",
          timestamp: "Sekarang",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden pb-20 md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-navy-950 dark:text-cream-50">
                  finoch<span className="text-navy-600 dark:text-cream-300">.id</span>
                </span>
              </div>
              <div className="hidden md:block">
                <Breadcrumbs className="mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Finoch AI Copilot
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
                  Teman finansial cerdas mahasiswa & anak kost berbasis kondisi keuangan riil
                </p>
              </div>
            </div>

            {/* Right: Theme Toggle */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Chat Container */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
          {/* Grounded Banner */}
          <div className="mb-3 p-3 rounded-2xl bg-cream-100 dark:bg-navy-900/60 border border-cream-300 dark:border-navy-800 text-xs text-navy-800 dark:text-cream-200 flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 shrink-0 text-navy-700 dark:text-cream-300" />
            <span>
              Jawaban didasarkan pada data transaksi riil kamu. Tanpa halusinasi angka.
            </span>
          </div>

          {/* Message History */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    msg.sender === "user"
                      ? "bg-cream-200 dark:bg-navy-800 text-navy-900 dark:text-cream-100"
                      : "bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 shadow-sm"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 rounded-tr-none"
                      : "bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 text-navy-950 dark:text-cream-50 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-2 flex items-center justify-between gap-2 ${
                      msg.sender === "user" ? "text-cream-300 dark:text-navy-700" : "text-navy-400 dark:text-cream-400/60"
                    }`}
                  >
                    {msg.sender === "copilot" && msg.source && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.source === "llm" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cream-100 dark:bg-navy-900 text-navy-900 dark:text-cream-100">
                            <Sparkles className="w-3 h-3" />
                            Live AI ({msg.model || msg.provider})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cream-100 dark:bg-navy-900 text-navy-700 dark:text-cream-300">
                            Mode Heuristik
                          </span>
                        )}
                        {msg.diagnostic && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">
                            ({msg.diagnostic})
                          </span>
                        )}
                      </div>
                    )}
                    <span className="ml-auto">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-4 rounded-2xl rounded-tl-none text-xs sm:text-sm text-navy-600 dark:text-cream-300/70 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-navy-800 dark:text-cream-200" />
                  <span>Menganalisis kondisi finansial kamu...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="mb-3 space-y-1.5 shrink-0">
            <div className="text-[11px] font-semibold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Pertanyaan Populer:
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] hover:bg-cream-100 dark:hover:bg-navy-900 text-xs text-navy-800 dark:text-cream-200 transition-colors shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-white dark:bg-[#070E1A] p-2 rounded-2xl border border-cream-300 dark:border-navy-800 shadow-sm shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanya jatah jajan, tips hemat, atau saran finansial ke Finoch..."
              className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-navy-950 dark:text-cream-50 placeholder-navy-400 dark:placeholder-cream-400/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 disabled:opacity-50 text-cream-50 dark:text-navy-950 rounded-xl shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} />
    </div>
  );
}

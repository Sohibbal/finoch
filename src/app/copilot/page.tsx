"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  Loader2,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Halo! Saya FINRA AI Copilot. Saya menganalisis kondisi finansial riil Anda dengan model 50/30/20. Ada pertanyaan mengenai pengeluaran, simulasi anggaran, atau target goal Anda?",
      timestamp: "Baru saja",
      source: "facts_fallback",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    "Kenapa tabungan saya bulan ini turun?",
    "Aman tidak kalau beli laptop sekarang?",
    "Berapa total pengeluaran makanan saya?",
    "Bagaimana cara mencapai rasio 20% tabungan?",
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
        throw new Error("Gagal menghubungi FINRA Copilot");
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#091124]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/20">
                <Bot className="w-5 h-5 text-blue-300 dark:text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  AI Copilot
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/simulator" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              What-If Simulator
            </Link>
            <Link href="/goals" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Goals
            </Link>
            <Link href="/copilot" className="text-blue-700 dark:text-blue-400 font-bold">
              AI Copilot
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {/* Grounded Banner */}
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Jawaban didasarkan pada fakta riil transaksi & model Digital Twin Anda. Tidak ada halusinasi matematika.
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
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <div
                  className={`text-[10px] mt-2 flex items-center justify-between gap-2 ${
                    msg.sender === "user" ? "text-emerald-100" : "text-slate-400"
                  }`}
                >
                  {msg.sender === "copilot" && msg.source && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.source === "llm" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <Sparkles className="w-3 h-3" />
                          Live AI ({msg.model || msg.provider})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Menganalisis kondisi finansial Anda...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="mb-3 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pertanyaan Populer:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs text-slate-700 dark:text-slate-300 transition-colors"
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
          className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanyakan analisis keuangan Anda ke FINRA..."
            className="flex-1 px-4 py-2 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}

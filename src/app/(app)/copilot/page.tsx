"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Wallet, TrendingUp, TrendingDown, Bot } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { FormattedBotMessage } from "@/components/copilot/formatted-message";
import { getTransactions } from "@/lib/storage/transaction-storage";
import { getWishlistItems } from "@/lib/storage/wishlist-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import { rupiah } from "@/lib/format";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  source?: "llm" | "facts_fallback";
}

/** FinBot avatar mark - matching sidebar Bot icon */
function FinBotAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xs finbot-fade-loop">
      <Bot className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
    </div>
  );
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Yo! Gue FinBot, asisten finansial pribadi lo. Tanya apa aja soal duit lo: 'Bulan ini gue paling boros apa?', 'Sisa uang jajan aman gak?', atau 'Kapan wishlist gue bisa kebeli?'. Semua langsung gue cek dari database lo, no halu-halu!",
      timestamp: "Baru saja",
      source: "facts_fallback",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [completedMsgIds, setCompletedMsgIds] = useState<Set<string>>(() => new Set(["msg-1"]));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollFrameRef = useRef<number | null>(null);

  const quickPrompts = [
    "Bulan ini gue paling boros apa?",
    "Sisa uang jajan gue masih aman gak?",
    "Kapan wishlist gue bisa kebeli?",
    "Kasih tips hemat biar gak boncos dong",
  ];

  // Load summary for side panel
  useEffect(() => {
    async function loadStats() {
      const txs = await getTransactions().catch(() => []);
      let inc = 0;
      let exp = 0;
      for (const t of txs) {
        if (t.type === "income") inc += t.amount;
        else if (t.type === "expense") exp += t.amount;
      }
      setSummary({ income: inc, expense: exp, balance: inc - exp });
    }
    loadStats();
  }, []);

  const scrollToBottom = (smooth = false) => {
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
    }
    scrollFrameRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    });
  };

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom(true);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        syncManager.triggerSync().catch(() => {});
      }

      const [txs, wls] = await Promise.all([
        getTransactions().catch(() => []),
        getWishlistItems().catch(() => []),
      ]);

      const clientFacts = {
        transactions: txs.map((t) => ({
          type: t.type,
          itemName: t.itemName,
          amount: t.amount,
          category: t.category,
          source: t.source,
          date: t.transactionDate,
        })),
        wishlists: wls.map((w) => ({
          name: w.name,
          targetPrice: w.targetPrice,
          savedAmount: w.savedAmount,
          isAchieved: w.isAchieved,
        })),
      };

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          clientFacts,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi FinBot server");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "copilot",
        text: data.reply || "Gue udah catat pertanyaannya, tapi kayaknya koneksi lagi ngadat.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        source: data.source,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "copilot",
          text: "Waduh, FinBot lagi rada ngelag nih koneksinya. Coba kirim ulang pertanyaan lo barusan ya!",
          timestamp: "Sekarang",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="FinBot Copilot"
        subtitle="Tanya finansial lo dengan cepat & santai, 100% valid dari database lo"
      />

      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-[2.25rem] bg-[#F8FAFC] dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row gap-5 h-[calc(100vh-12rem)] min-h-[580px]">
          {/* Left Side: Financial Context & Quick Actions Panel (Desktop) */}
          <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col gap-4 animate-content-in">
            <div className="rounded-[2rem] p-5 backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs glass-sheen relative overflow-hidden group space-y-4">
              {/* Transparent Watermark Icon */}
              <Wallet
                className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/10 dark:text-blue-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                strokeWidth={1.5}
              />
              <div className="relative z-10 space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-500" />
                    <span>Konteks Finansial</span>
                  </p>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white money mt-1">
                    {rupiah(summary.balance)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Saldo bersih aktif</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span>Pemasukan:</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{rupiah(summary.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                      <span>Pengeluaran:</span>
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      -{rupiah(summary.expense)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-[2rem] p-5 backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pusat Tanya Cepat</span>
                  </p>
                  <div className="mt-3 space-y-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left text-xs p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  100% tersinkron dengan tabel transaksi lo.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Side: Chat Container */}
          <section className="flex-1 flex flex-col min-w-0 h-full animate-content-in">
            {/* Chat message history container */}
            <div className="flex-1 rounded-[2rem] backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3.5 p-4 sm:p-5">
                {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isUser && <FinBotAvatar />}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs space-y-1.5 ${
                        isUser
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-xs"
                          : "bg-slate-50 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-white rounded-tl-xs"
                      }`}
                    >
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : completedMsgIds.has(msg.id) ? (
                          <FormattedBotMessage text={msg.text} />
                        ) : (
                          <TypewriterText
                            text={msg.text}
                            formatMarkdown={true}
                            speed={12}
                            onTick={() => scrollToBottom(false)}
                            onComplete={() => {
                              setCompletedMsgIds((prev) => {
                                const next = new Set(prev);
                                next.add(msg.id);
                                return next;
                              });
                              scrollToBottom(true);
                            }}
                          />
                        )}
                      </div>
                      <div
                        className={`text-[10px] opacity-60 flex items-center gap-2 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.source === "llm" && <span>• AI Gen-Z</span>}
                        {!isUser && msg.source === "facts_fallback" && <span>• Database Facts</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <FinBotAvatar />
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex items-center gap-2 text-slate-500 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>FinBot lagi ngecek database lo...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Prompts Mobile Strip */}
            <div className="py-2.5 flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ketik pertanyaan seputar duit lo ke FinBot..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#111C2E] text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="h-11 px-4 sm:px-5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}

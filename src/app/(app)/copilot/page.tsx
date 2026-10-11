"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Sparkles, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { getTransactions } from "@/lib/storage/transaction-storage";
import { getWishlistItems } from "@/lib/storage/wishlist-storage";
import { syncManager } from "@/lib/sync/sync-manager";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  source?: "llm" | "facts_fallback";
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Yo! Gue FinBot 🤖 Asisten finansial pribadi lo. Tanya apa aja soal duit lo: 'Bulan ini gue paling boros apa?', 'Sisa uang jajan aman gak?', atau 'Kapan wishlist gue bisa kebeli?'. Semua langsung gue cek dari database lo, no halu-halu!",
      timestamp: "Baru saja",
      source: "facts_fallback",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    "Bulan ini gue paling boros apa?",
    "Sisa uang jajan gue masih aman gak?",
    "Kapan wishlist gue bisa kebeli?",
    "Kasih tips hemat biar gak boncos dong",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
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
      // Trigger background sync to server
      syncManager.triggerSync().catch(() => {});

      let clientFacts: any = undefined;
      try {
        const [txList, wList] = await Promise.all([
          getTransactions(),
          getWishlistItems(),
        ]);
        let inc = 0;
        let exp = 0;
        let topCategory = "Pengeluaran Harian";
        const catMap: Record<string, number> = {};
        for (const t of txList) {
          if (t.type === "income") inc += t.amount;
          else if (t.type === "expense") {
            exp += t.amount;
            catMap[t.category] = (catMap[t.category] || 0) + t.amount;
          }
        }
        let maxCatAmount = 0;
        for (const [c, a] of Object.entries(catMap)) {
          if (a > maxCatAmount) {
            maxCatAmount = a;
            topCategory = c;
          }
        }
        const activeW = wList.filter((w) => !w.isAchieved);
        clientFacts = {
          monthlyIncome: inc,
          monthlyExpense: exp,
          netBalance: inc - exp,
          topExpenseCategory: topCategory,
          wishlistSummary: activeW.length > 0 ? activeW.map((w, idx) => `${idx + 1}. ${w.name}`).join(", ") : undefined,
        };
      } catch {
        // ignore
      }

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), clientFacts }),
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi FinBot");
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

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        {/* Chat message history container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/10 dark:border-navy-800 shadow-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm space-y-1.5 ${
                    isUser
                      ? "bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 rounded-tr-sm"
                      : "bg-paper dark:bg-navy-950 border border-ink/10 dark:border-navy-800 text-ink dark:text-white rounded-tl-sm"
                  }`}
                >
                  <p className="text-body leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-meta opacity-60 flex items-center gap-2 ${
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
              <div className="w-9 h-9 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-paper dark:bg-navy-950 border border-ink/10 dark:border-navy-800 flex items-center gap-2 text-ink-soft dark:text-navy-400 text-body">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>FinBot lagi ngecek database lo...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-meta font-semibold text-ink-soft dark:text-navy-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Tanya Cepat:</span>
          </span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-meta px-3 py-1.5 rounded-full border border-ink/15 dark:border-navy-700 bg-paper-sheet dark:bg-navy-900 text-ink dark:text-white hover:bg-ink/5 dark:hover:bg-navy-800 shrink-0 transition-colors"
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
          className="flex items-center gap-2 pt-1 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ketik pertanyaan seputar uang lo ke FinBot..."
            className="flex-1 px-5 py-3.5 rounded-2xl border border-ink/15 dark:border-navy-700 bg-paper-sheet dark:bg-navy-900 text-ink dark:text-white placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center"
            title="Kirim Pesan"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </main>
    </>
  );
}

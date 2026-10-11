"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpRight, Loader2, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

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
      text: "Hai, aku Finoch. Tanya aja soal duitmu: jatah hari ini, cukup nggak sampai kiriman berikutnya, atau aman nggak beli sesuatu minggu ini. Jawabanku dihitung dari catatanmu sendiri.",
      timestamp: "Baru saja",
      source: "facts_fallback",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLLIElement | null>(null);
  const hasAsked = messages.some((m) => m.sender === "user");

  const quickPrompts = [
    "Jatah jajan hari ini masih aman nggak?",
    "Gimana trik hemat makan biar uang kiriman cukup sebulan?",
    "Aman nggak kalau beli sepatu/baju baru minggu ini?",
    "Kiat bertahan hidup saat krisis tanggal tua",
  ];

  const scrollToBottom = () => {
    // Reduced motion jumps straight to the newest message.
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    // Only the greeting so far: leave it read from its first line instead of scrolled mid-sentence.
    if (messages.length <= 1) return;
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
          text: "Maaf, Copilot lagi nggak bisa dihubungi. Cek koneksi, lalu kirim ulang pertanyaanmu.",
          timestamp: "Sekarang",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Copilot AI" subtitle="Tanya soal duitmu, dijawab dari catatanmu sendiri" />

      {/* Fills the viewport between header and the shell bottom inset; only the conversation scrolls. */}
      <main className="h-[calc(100dvh-16.5rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-7.5rem)] max-w-3xl w-full mx-auto px-4 sm:px-6 pt-4 pb-4 flex flex-col overflow-hidden">
        <p className="text-meta text-ink-soft shrink-0 pb-3 border-b border-ink/15">
          Angka di jawaban dihitung dari pengeluaran dan target yang kamu catat.
        </p>

        <ol className="flex-1 overflow-y-auto py-4 space-y-4" aria-live="polite">
          {messages.map((msg) =>
            msg.sender === "user" ? (
              <li key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-ink text-paper-sheet dark:text-paper px-4 py-3">
                  <p className="text-body whitespace-pre-line break-words">{msg.text}</p>
                  <p className="mt-1 text-meta opacity-80 text-right">Kamu · {msg.timestamp}</p>
                </div>
              </li>
            ) : (
              <li key={msg.id} className="max-w-[92%]">
                {/* Copilot answers are printed slips, torn off the same pad as the stubs. */}
                <div className="relative bg-paper-sheet border border-ink/15 pl-5 pr-4 py-3">
                  <span aria-hidden="true" className="absolute left-2 top-2 bottom-2 border-l border-dotted border-ink/40" />
                  <p className="text-body text-ink whitespace-pre-line break-words">{msg.text}</p>
                  <p className="mt-2 text-meta text-ink-soft">
                    Finoch
                    {msg.source === "llm" && ` · dijawab AI${msg.model || msg.provider ? ` (${msg.model || msg.provider})` : ""}`}
                    {msg.source === "facts_fallback" && " · mode hitung offline"}
                    {msg.diagnostic && <span className="text-mepet-ink"> · {msg.diagnostic}</span>} · {msg.timestamp}
                  </p>
                </div>
              </li>
            )
          )}

          {/* Before the first question the middle holds the questions themselves, printed as slips to tear off. */}
          {!hasAsked && (
            <li>
              <h2 className="text-body font-semibold text-ink mb-2">Coba tanya ini</h2>
              <ul className="space-y-2">
                {quickPrompts.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="relative w-full min-h-11 flex items-center justify-between gap-3 bg-paper-sheet border border-ink/15 pl-5 pr-4 py-3 text-left text-body text-ink hover:border-ink/40 disabled:opacity-50 transition-colors"
                    >
                      <span aria-hidden="true" className="absolute left-2 top-2 bottom-2 border-l border-dotted border-ink/40" />
                      {prompt}
                      <ArrowUpRight className="w-4 h-4 shrink-0 text-ink-soft" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )}

          {isLoading && (
            <li className="max-w-[92%]">
              <div className="relative bg-paper-sheet border border-dashed border-ink/40 pl-5 pr-4 py-3 flex items-center gap-2 text-body text-ink-soft">
                <Loader2 className="w-4 h-4 motion-safe:animate-spin" aria-hidden="true" />
                Lagi ngitung dari catatanmu...
              </div>
            </li>
          )}

          <li ref={messagesEndRef} aria-hidden="true" />
        </ol>

        {hasAsked && (
          <div className="shrink-0 pb-3 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="text-meta text-ink-soft mb-1.5">Sering ditanya</p>
            <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="min-h-11 px-3 border border-ink/30 text-body text-ink text-left hover:bg-ink/5 disabled:opacity-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="shrink-0 flex items-end gap-2 border-t-2 border-ink pt-3"
        >
          <label htmlFor="copilot-input" className="sr-only">
            Pertanyaan untuk Copilot
          </label>
          <input
            id="copilot-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanya jatah jajan, tips hemat..."
            className="flex-1 min-w-0 min-h-11 px-0 bg-transparent border-b border-dotted border-ink/50 text-body text-ink placeholder:text-ink-soft focus-visible:outline-offset-4"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            aria-label="Kirim pertanyaan"
            className="w-11 h-11 shrink-0 rounded-full bg-ink hover:bg-ink/90 disabled:opacity-40 text-paper-sheet dark:text-paper flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </main>
    </>
  );
}

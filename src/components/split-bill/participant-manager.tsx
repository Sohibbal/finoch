"use client";

import React, { useState } from "react";
import { UserPlus, X, UserCheck } from "lucide-react";
import { Participant } from "@/types/split-bill-types";

interface ParticipantManagerProps {
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
}

export function ParticipantManager({
  participants,
  onAddParticipant,
  onRemoveParticipant,
}: ParticipantManagerProps) {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onAddParticipant(nameInput.trim());
    setNameInput("");
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider">
            Siapa Saja yang Makan? ({participants.length} Orang)
          </h2>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Ketik nama teman (misal: Budi, Siti, Rian)..."
          className="flex-1 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <button
          type="submit"
          disabled={!nameInput.trim()}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </form>

      {/* Participant Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {participants.map((p) => (
          <div
            key={p.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              p.isUser
                ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                : "bg-cream-100/70 dark:bg-navy-800/60 text-navy-800 dark:text-cream-200 border-cream-300 dark:border-navy-700"
            }`}
          >
            <span>{p.name}</span>
            {p.isUser ? (
              <span className="text-[10px] opacity-75 font-normal">(Saya)</span>
            ) : (
              <button
                type="button"
                onClick={() => onRemoveParticipant(p.id)}
                className="hover:text-rose-500 p-0.5 rounded transition-colors"
                title={`Hapus ${p.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

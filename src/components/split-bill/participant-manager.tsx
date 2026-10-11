"use client";

import React, { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Participant } from "@/types/split-bill-types";
import { FIELD_CLASS, OptionButton } from "@/components/press/kampus-press";

interface ParticipantManagerProps {
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
  mode: "itemized" | "equal";
  onModeChange: (mode: "itemized" | "equal") => void;
}

/** Who ate, and whether the nota is split per menu or evenly. */
export function ParticipantManager({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  mode,
  onModeChange,
}: ParticipantManagerProps) {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onAddParticipant(nameInput.trim());
    setNameInput("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h3 className="text-body font-bold text-ink">Yang ikut makan · {participants.length} orang</h3>
        <div className="grid grid-cols-2" role="group" aria-label="Cara bagi">
          <OptionButton pressed={mode === "itemized"} onClick={() => onModeChange("itemized")}>
            Per menu
          </OptionButton>
          <OptionButton pressed={mode === "equal"} onClick={() => onModeChange("equal")} className="-ml-px">
            Bagi rata
          </OptionButton>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        {participants.map((p) => (
          <li
            key={p.id}
            className={`inline-flex items-center min-h-11 pl-3 border text-body font-semibold ${
              p.isUser ? "bg-ink text-paper-sheet border-ink pr-3" : "bg-paper-sheet text-ink border-ink/30 pr-0"
            }`}
          >
            {p.name}
            {!p.isUser && (
              <button
                type="button"
                onClick={() => onRemoveParticipant(p.id)}
                aria-label={`Hapus ${p.name}`}
                className="w-11 h-11 flex items-center justify-center text-ink-soft hover:text-habis-ink transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="split-friend-name" className="sr-only">
          Nama teman
        </label>
        <input
          id="split-friend-name"
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nama teman, misal Rian"
          className={`${FIELD_CLASS} flex-1 min-w-0`}
        />
        <button
          type="submit"
          disabled={!nameInput.trim()}
          className="inline-flex items-center gap-1.5 min-h-11 px-4 shrink-0 border border-ink text-ink text-body font-semibold hover:bg-ink/5 transition-colors disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Tambah
        </button>
      </form>
      {participants.length === 1 && (
        <p className="text-meta text-ink-soft">Tambah teman yang ikut makan biar tiap orang dapat sobekan tagihannya.</p>
      )}
    </div>
  );
}

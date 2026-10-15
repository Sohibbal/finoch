import { getStorageScope } from "./local-storage";

export interface FinBotChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  source?: "llm" | "facts_fallback";
}

export const DEFAULT_FINBOT_GREETING: FinBotChatMessage = {
  id: "msg-1",
  sender: "copilot",
  text: "Yo! Gue FinBot, asisten finansial pribadi lo. Tanya apa aja soal duit lo: 'Bulan ini gue paling boros apa?', 'Sisa uang jajan aman gak?', atau 'Kapan wishlist gue bisa kebeli?'. Semua langsung gue cek dari database lo, no halu-halu!",
  timestamp: "Baru saja",
  source: "facts_fallback",
};

const CHAT_STORAGE_PREFIX = "finoch_finbot_chat::";
export const FINBOT_CHAT_RESET_EVENT = "finoch:finbot-chat-reset";

/**
 * Loads conversation messages from local storage scoped by current user.
 * Falls back to default FinBot greeting when empty or in SSR.
 */
export function getFinBotChatHistory(): FinBotChatMessage[] {
  if (typeof window === "undefined") {
    return [DEFAULT_FINBOT_GREETING];
  }
  try {
    const scope = getStorageScope();
    const raw = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${scope}`);
    if (!raw) {
      return [DEFAULT_FINBOT_GREETING];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_FINBOT_GREETING];
  } catch {
    return [DEFAULT_FINBOT_GREETING];
  }
}

/**
 * Saves conversation messages into storage scoped by user session.
 */
export function saveFinBotChatHistory(messages: FinBotChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const scope = getStorageScope();
    localStorage.setItem(`${CHAT_STORAGE_PREFIX}${scope}`, JSON.stringify(messages));
  } catch {
    // Ignore local storage quota limits or disabled storage
  }
}

/**
 * Completely clears conversation history for the current or specified user scope,
 * dispatched whenever user resets chat or performs account logout.
 */
export function clearFinBotChatHistory(scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const targetScope = scope || getStorageScope();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${targetScope}`);
      localStorage.removeItem("finoch_finbot_chat");
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("finoch_finbot_chat");
    }
    window.dispatchEvent(new Event(FINBOT_CHAT_RESET_EVENT));
  } catch {
    // Ignore storage deletion errors
  }
}

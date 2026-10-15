import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getFinBotChatHistory,
  saveFinBotChatHistory,
  clearFinBotChatHistory,
  DEFAULT_FINBOT_GREETING,
  FINBOT_CHAT_RESET_EVENT,
  type FinBotChatMessage,
} from "@/lib/storage/finbot-chat-storage";

describe("FinBot Chat Storage", () => {
  let store: Map<string, string>;
  let eventListeners: Record<string, ((e: Event) => void)[]>;

  beforeEach(() => {
    store = new Map<string, string>();
    eventListeners = {};

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    });

    vi.stubGlobal("window", {
      dispatchEvent: (event: Event) => {
        const listeners = eventListeners[event.type] || [];
        listeners.forEach((fn) => fn(event));
        return true;
      },
      addEventListener: (type: string, fn: (e: Event) => void) => {
        if (!eventListeners[type]) eventListeners[type] = [];
        eventListeners[type].push(fn);
      },
      removeEventListener: (type: string, fn: (e: Event) => void) => {
        if (!eventListeners[type]) return;
        eventListeners[type] = eventListeners[type].filter((cb) => cb !== fn);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns default greeting when no previous conversation is stored", () => {
    const history = getFinBotChatHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(DEFAULT_FINBOT_GREETING.id);
    expect(history[0].sender).toBe("copilot");
    expect(history[0].text).toContain("FinBot");
  });

  it("saves and retrieves conversation messages across feature navigation", () => {
    const customMessages: FinBotChatMessage[] = [
      DEFAULT_FINBOT_GREETING,
      {
        id: "user-101",
        sender: "user",
        text: "Berapa sisa jatah gue hari ini?",
        timestamp: "10:00",
      },
      {
        id: "bot-102",
        sender: "copilot",
        text: "Sisa jatah lo Rp105.000, aman terkendali bro!",
        timestamp: "10:01",
      },
    ];

    saveFinBotChatHistory(customMessages);
    const loaded = getFinBotChatHistory();
    expect(loaded).toHaveLength(3);
    expect(loaded[1].text).toBe("Berapa sisa jatah gue hari ini?");
    expect(loaded[2].text).toBe("Sisa jatah lo Rp105.000, aman terkendali bro!");
  });

  it("clears conversation and dispatches reset event when reset or logout is triggered", () => {
    let eventFired = false;
    window.addEventListener(FINBOT_CHAT_RESET_EVENT, () => {
      eventFired = true;
    });

    saveFinBotChatHistory([
      DEFAULT_FINBOT_GREETING,
      {
        id: "user-101",
        sender: "user",
        text: "Halo!",
        timestamp: "11:00",
      },
    ]);

    expect(getFinBotChatHistory()).toHaveLength(2);
    clearFinBotChatHistory();

    expect(eventFired).toBe(true);
    expect(getFinBotChatHistory()).toEqual([DEFAULT_FINBOT_GREETING]);
  });
});

// tests/hooks/use-hybrid-speech.test.ts
import { describe, it, expect } from "vitest";
import { determineEngineMode } from "@/hooks/use-hybrid-speech";

describe("useHybridSpeech Hook & Engine Selector", () => {
  it("determines online mode when network is online", () => {
    const mode = determineEngineMode({
      isOnline: true,
      isModelDownloaded: false,
    });
    expect(mode).toBe("online");

    const modeWithModel = determineEngineMode({
      isOnline: true,
      isModelDownloaded: true,
    });
    expect(modeWithModel).toBe("online");
  });

  it("determines offline-whisper mode when offline and model is downloaded", () => {
    const mode = determineEngineMode({
      isOnline: false,
      isModelDownloaded: true,
    });
    expect(mode).toBe("offline-whisper");
  });

  it("determines offline-unready mode when offline and model is not downloaded", () => {
    const mode = determineEngineMode({
      isOnline: false,
      isModelDownloaded: false,
    });
    expect(mode).toBe("offline-unready");
  });

  it("uses Whisper when the browser has no online speech recognition", () => {
    expect(determineEngineMode({ isOnline: true, isOnlineSpeechSupported: false, isModelDownloaded: true })).toBe("offline-whisper");
    expect(determineEngineMode({ isOnline: true, isOnlineSpeechSupported: false, isModelDownloaded: false })).toBe("offline-unready");
  });

  it("exports useHybridSpeech function", async () => {
    const module = await import("@/hooks/use-hybrid-speech");
    expect(typeof module.useHybridSpeech).toBe("function");
  });
});

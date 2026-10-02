// tests/hooks/use-offline-whisper.test.ts
import { describe, it, expect } from "vitest";

describe("useOfflineWhisper Hook Specification", () => {
  it("exports useOfflineWhisper function and constants", async () => {
    const module = await import("@/hooks/use-offline-whisper");
    expect(typeof module.useOfflineWhisper).toBe("function");
    expect(typeof module.WHISPER_STORAGE_KEY).toBe("string");
    expect(typeof module.WHISPER_MODEL_ID).toBe("string");
  });

  it("defines default storage key and model id", async () => {
    const module = await import("@/hooks/use-offline-whisper");
    expect(module.WHISPER_STORAGE_KEY).toBe("voicash_offline_whisper_ready");
    expect(module.WHISPER_MODEL_ID).toBe("Xenova/whisper-tiny");
  });
});

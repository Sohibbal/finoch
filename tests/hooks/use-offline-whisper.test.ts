// tests/hooks/use-offline-whisper.test.ts
import { describe, it, expect } from "vitest";

describe("useOfflineWhisper Hook Specification", () => {
  it("exports useOfflineWhisper function and constants", async () => {
    const module = await import("@/hooks/use-offline-whisper");
    expect(typeof module.useOfflineWhisper).toBe("function");
    expect(typeof module.WHISPER_STORAGE_KEY).toBe("string");
    expect(typeof module.OFFLINE_MODEL_CONFIGS).toBe("object");
  });

  it("defines default storage key and tier configurations", async () => {
    const module = await import("@/hooks/use-offline-whisper");
    expect(module.WHISPER_STORAGE_KEY).toBe("voicash_offline_whisper_ready");
    expect(module.DEFAULT_OFFLINE_TIER).toBe("base");

    const baseConfig = module.OFFLINE_MODEL_CONFIGS.base;
    expect(baseConfig.modelId).toBe("Xenova/whisper-base");
    expect(baseConfig.sizeLabel).toBe("~77 MB");

    const smallConfig = module.OFFLINE_MODEL_CONFIGS.small;
    expect(smallConfig.modelId).toBe("Xenova/whisper-small");
    expect(smallConfig.sizeLabel).toBe("~242 MB");
  });
});

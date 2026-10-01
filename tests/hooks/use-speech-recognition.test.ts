// tests/hooks/use-speech-recognition.test.ts
import { describe, it, expect } from "vitest";

describe("useSpeechRecognition Hook Specification", () => {
  it("exports useSpeechRecognition function", async () => {
    const module = await import("@/hooks/use-speech-recognition");
    expect(typeof module.useSpeechRecognition).toBe("function");
  });

  it("exports silence timeout constant as 2000ms", async () => {
    const module = await import("@/hooks/use-speech-recognition");
    expect(module.SILENCE_TIMEOUT_MS).toBe(2000);
  });

  it("exports language code constant as id-ID", async () => {
    const module = await import("@/hooks/use-speech-recognition");
    expect(module.SPEECH_LANG_ID).toBe("id-ID");
  });
});

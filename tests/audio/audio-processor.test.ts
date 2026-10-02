// tests/audio/audio-processor.test.ts
import { describe, it, expect } from "vitest";
import {
  resampleTo16kHz,
  normalizeAudio,
  isAudioSilent,
  checkAudioSupport,
} from "@/lib/audio/audio-processor";

describe("Audio Processor Module", () => {
  describe("resampleTo16kHz", () => {
    it("returns identical length when input sample rate is already 16000 Hz", () => {
      const input = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const resampled = resampleTo16kHz(input, 16000);
      expect(resampled.length).toBe(4);
      expect(resampled[0]).toBeCloseTo(0.1);
      expect(resampled[3]).toBeCloseTo(0.4);
    });

    it("downsamples 48000 Hz to 16000 Hz correctly (3:1 ratio)", () => {
      // 48000 Hz with 6 samples should downsample to 2 samples at 16000 Hz
      const input = new Float32Array([0.0, 0.3, 0.6, 0.9, 0.6, 0.3]);
      const resampled = resampleTo16kHz(input, 48000);
      expect(resampled.length).toBe(2);
    });

    it("downsamples 44100 Hz to 16000 Hz correctly", () => {
      const input = new Float32Array(44100);
      const resampled = resampleTo16kHz(input, 44100);
      expect(resampled.length).toBe(16000);
    });

    it("handles empty audio input gracefully", () => {
      const empty = new Float32Array(0);
      const resampled = resampleTo16kHz(empty, 48000);
      expect(resampled.length).toBe(0);
    });
  });

  describe("normalizeAudio", () => {
    it("normalizes peak volume to target amplitude without clipping", () => {
      const input = new Float32Array([0.1, -0.5, 0.25]);
      const normalized = normalizeAudio(input, 0.9);
      // Max absolute peak was 0.5. With target 0.9, multiplier is 1.8.
      expect(normalized[1]).toBeCloseTo(-0.9);
      expect(normalized[0]).toBeCloseTo(0.18);
    });

    it("does not amplify completely silent audio", () => {
      const input = new Float32Array([0.0, 0.0, 0.0]);
      const normalized = normalizeAudio(input, 0.9);
      expect(normalized[0]).toBe(0);
      expect(normalized[1]).toBe(0);
    });
  });

  describe("isAudioSilent", () => {
    it("detects silent audio when RMS is below threshold", () => {
      const silent = new Float32Array([0.001, -0.001, 0.0005]);
      expect(isAudioSilent(silent, 0.01)).toBe(true);
    });

    it("detects non-silent audio with actual voice amplitude", () => {
      const voice = new Float32Array([0.05, 0.3, -0.4, 0.2]);
      expect(isAudioSilent(voice, 0.01)).toBe(false);
    });

    it("returns true for empty audio buffer", () => {
      expect(isAudioSilent(new Float32Array(0))).toBe(true);
    });
  });

  describe("checkAudioSupport", () => {
    it("returns an object with supported status and mimeType", () => {
      const support = checkAudioSupport();
      expect(typeof support.supported).toBe("boolean");
      expect(typeof support.mimeType).toBe("string");
    });
  });
});

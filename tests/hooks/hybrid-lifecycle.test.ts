import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", () => import("./react-harness"));
const mocks = vi.hoisted(() => ({ online: { isSupported: true, error: null as string | null, startListening: vi.fn(), resetTranscript: vi.fn(), stopListening: vi.fn() }, offline: { isModelDownloaded: true } }));
vi.mock("@/hooks/use-speech-recognition", () => ({ useSpeechRecognition: () => mocks.online }));
vi.mock("@/hooks/use-offline-whisper", () => ({ useOfflineWhisper: () => mocks.offline }));
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { checkAudioSupport } from "@/lib/audio/audio-processor";
let events: Record<string, () => void>;
let stopTrack: ReturnType<typeof vi.fn>;
beforeEach(() => {
  resetHooks(); vi.useFakeTimers(); vi.clearAllMocks(); mocks.online.error = null; mocks.online.isSupported = true;
  events = {}; stopTrack = vi.fn();
  vi.stubGlobal("window", { addEventListener: (name: string, fn: () => void) => { events[name] = fn; }, removeEventListener: vi.fn() });
  vi.stubGlobal("navigator", { onLine: true, mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }) } });
});
afterEach(() => { unmountHooks(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it.each(["retry", "online", "timeout"])("recovers from an SR network failure on %s without changing connectivity", async recovery => {
  renderHook(useHybridSpeech); mocks.online.error = "network"; renderHook(useHybridSpeech);
  let hook = renderHook(useHybridSpeech); expect(hook.engineMode).toBe("offline-whisper"); expect(hook.isOnline).toBe(true);
  if (recovery === "retry") await hook.startListening();
  if (recovery === "online") events.online();
  if (recovery === "timeout") vi.advanceTimersByTime(30000);
  hook = renderHook(useHybridSpeech); expect(hook.engineMode).toBe("online");
  if (recovery === "retry") expect(mocks.online.startListening).toHaveBeenCalledOnce();
});
it("stops microphone tracks and reports recorder failure accurately", async () => {
  mocks.online.isSupported = false;
  class Recorder { static isTypeSupported = () => true; constructor() { throw new Error("codec unavailable"); } }
  vi.stubGlobal("MediaRecorder", Recorder);
  await renderHook(useHybridSpeech).startListening();
  expect(stopTrack).toHaveBeenCalledOnce();
  expect(renderHook(useHybridSpeech).error).toBe("Tidak dapat memulai perekam suara pada browser ini.");
});
it("selects a supported MIME type and lets the browser choose when none are advertised", () => {
  vi.stubGlobal("MediaRecorder", { isTypeSupported: (type: string) => type === "audio/mp4" });
  expect(checkAudioSupport().mimeType).toBe("audio/mp4");
  vi.stubGlobal("MediaRecorder", { isTypeSupported: () => false });
  expect(checkAudioSupport().mimeType).toBe("");
});

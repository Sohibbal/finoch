import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", () => import("./react-harness"));
import { useSpeechRecognition, INITIAL_NO_SPEECH_TIMEOUT_MS, SILENCE_TIMEOUT_MS } from "@/hooks/use-speech-recognition";
class Recognition {
  static latest: Recognition;
  onstart: any; onresult: any;
  start = vi.fn(() => this.onstart()); stop = vi.fn(); abort = vi.fn();
  constructor() { Recognition.latest = this; }
}
beforeEach(() => { resetHooks(); vi.useFakeTimers(); vi.stubGlobal("window", { SpeechRecognition: Recognition }); vi.stubGlobal("navigator", { onLine: true }); });
afterEach(() => { unmountHooks(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it("allows a slow speaker to start, then applies the short silence timeout after speech", () => {
  renderHook(useSpeechRecognition); const hook = renderHook(useSpeechRecognition); hook.startListening();
  const recognition = Recognition.latest;
  vi.advanceTimersByTime(SILENCE_TIMEOUT_MS + 1000); expect(recognition.stop).not.toHaveBeenCalled();
  recognition.onresult({ resultIndex: 0, results: [{ 0: { transcript: "nasi" }, isFinal: false }] });
  vi.advanceTimersByTime(SILENCE_TIMEOUT_MS - 1); expect(recognition.stop).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1); expect(recognition.stop).toHaveBeenCalledOnce();
});
it("still bounds initial no-speech waiting and clears timers on unmount", () => {
  renderHook(useSpeechRecognition); renderHook(useSpeechRecognition).startListening();
  vi.advanceTimersByTime(INITIAL_NO_SPEECH_TIMEOUT_MS); expect(Recognition.latest.stop).toHaveBeenCalledOnce();
  renderHook(useSpeechRecognition).startListening(); unmountHooks();
  vi.advanceTimersByTime(INITIAL_NO_SPEECH_TIMEOUT_MS); expect(Recognition.latest.stop).toHaveBeenCalledOnce();
});

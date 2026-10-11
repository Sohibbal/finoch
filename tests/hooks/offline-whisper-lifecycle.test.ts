import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", () => import("./react-harness"));
import { useOfflineWhisper, WHISPER_MODEL_FILES, WHISPER_STORAGE_KEY, isWhisperModelCached } from "@/hooks/use-offline-whisper";

class MockWorker {
  static instances: MockWorker[] = [];
  onmessage: any;
  onerror: any;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() { MockWorker.instances.push(this); }
}
let storage: Map<string, string>;
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
beforeEach(() => {
  resetHooks(); MockWorker.instances = []; storage = new Map();
  vi.stubGlobal("window", {});
  vi.stubGlobal("Worker", MockWorker);
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
  vi.stubGlobal("caches", { has: vi.fn().mockResolvedValue(false), open: vi.fn().mockResolvedValue({ addAll: vi.fn().mockResolvedValue(undefined) }) });
});
afterEach(() => { unmountHooks(); vi.unstubAllGlobals(); });

describe("offline Whisper lifecycle", () => {
  it("rejects download and transcription on worker crash and can create a replacement", async () => {
    let hook = renderHook(useOfflineWhisper);
    const download = hook.downloadModel();
    const downloadAssertion = expect(download).rejects.toThrow("crash");
    await flush();
    const transcription = hook.transcribe(new Float32Array(1));
    const transcriptionAssertion = expect(transcription).rejects.toThrow("crash");
    const worker = MockWorker.instances[0];
    worker.onerror({ message: "crash", preventDefault: vi.fn() });
    await Promise.all([downloadAssertion, transcriptionAssertion]);
    hook = renderHook(useOfflineWhisper);
    expect(hook.isDownloading).toBe(false);
    expect(hook.isTranscribing).toBe(false);
    expect(worker.terminate).toHaveBeenCalledOnce();
    const retry = hook.transcribe(new Float32Array(1));
    MockWorker.instances[1].onmessage({ data: { status: "complete", output: "retry", requestId: 2 } });
    expect(await retry).toBe("retry");
  });
  it("rejects a superseded transcription and ignores its late response", async () => {
    const hook = renderHook(useOfflineWhisper);
    const first = hook.transcribe(new Float32Array(1));
    const rejected = expect(first).rejects.toThrow("digantikan");
    const second = hook.transcribe(new Float32Array(1));
    let resolved = false; void second.then(() => { resolved = true; });
    const worker = MockWorker.instances[0];
    worker.onmessage({ data: { status: "complete", requestId: 1, output: "old" } });
    await flush(); expect(resolved).toBe(false);
    worker.onmessage({ data: { status: "complete", requestId: 2, output: "new" } });
    await rejected; expect(await second).toBe("new");
  });
  it("clears stale readiness and never starts warmup when the cache was evicted", async () => {
    storage.set(WHISPER_STORAGE_KEY, "true");
    renderHook(useOfflineWhisper); await flush();
    expect(renderHook(useOfflineWhisper).isModelDownloaded).toBe(false);
    expect(storage.has(WHISPER_STORAGE_KEY)).toBe(false);
    expect(MockWorker.instances).toHaveLength(0);
  });
  it("requires all model files and warms only a complete cache", async () => {
    const match = vi.fn().mockResolvedValue(new Response("model"));
    vi.stubGlobal("caches", { has: vi.fn().mockResolvedValue(true), open: vi.fn().mockResolvedValue({ match }) });
    expect(await isWhisperModelCached("Xenova/whisper-base")).toBe(true);
    expect(match).toHaveBeenCalledTimes(WHISPER_MODEL_FILES.length);
    storage.set(WHISPER_STORAGE_KEY, "true"); renderHook(useOfflineWhisper); await flush();
    expect(MockWorker.instances[0].postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "warmup" }));
    match.mockImplementation(async (url: string) => url.endsWith("encoder_model_quantized.onnx") ? undefined : new Response("model"));
    expect(await isWhisperModelCached("Xenova/whisper-base")).toBe(false);
  });
  it("settles pending transcription on unmount", async () => {
    const pending = renderHook(useOfflineWhisper).transcribe(new Float32Array(1));
    const assertion = expect(pending).rejects.toThrow("ditutup");
    unmountHooks(); await assertion;
  });
});

import { beforeEach, afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ pipeline: vi.fn(), createWorker: vi.fn() }));
vi.mock("@xenova/transformers", () => ({ pipeline: mocks.pipeline, env: {} }));
vi.mock("tesseract.js", () => ({ createWorker: mocks.createWorker }));
beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); vi.stubGlobal("self", { addEventListener: vi.fn(), postMessage: vi.fn() }); });
afterEach(() => vi.unstubAllGlobals());
it("shares one in-flight Whisper pipeline across concurrent requests", async () => {
  let resolve!: (value: unknown) => void;
  mocks.pipeline.mockReturnValue(new Promise(done => { resolve = done; }));
  const { PipelineSingleton } = await import("@/workers/whisper.worker");
  const first = PipelineSingleton.getInstance(); const second = PipelineSingleton.getInstance();
  expect(mocks.pipeline).toHaveBeenCalledTimes(1);
  const model = {}; resolve(model);
  expect(await first).toBe(model); expect(await second).toBe(model);
});
it("retries a failed pipeline load", async () => {
  mocks.pipeline.mockRejectedValueOnce(new Error("load failed")).mockResolvedValueOnce({});
  const { PipelineSingleton } = await import("@/workers/whisper.worker");
  await expect(PipelineSingleton.getInstance()).rejects.toThrow("load failed");
  await PipelineSingleton.getInstance(); expect(mocks.pipeline).toHaveBeenCalledTimes(2);
});
it("shares a warmup with an explicit load", async () => {
  let resolve!: (value: unknown) => void;
  mocks.pipeline.mockReturnValue(new Promise(done => { resolve = done; }));
  await import("@/workers/whisper.worker");
  const handler = vi.mocked(self.addEventListener).mock.calls[0][1] as any;
  const warmup = handler({ data: { type: "warmup", model: "Xenova/whisper-base" } });
  const load = handler({ data: { type: "load", model: "Xenova/whisper-base" } });
  expect(mocks.pipeline).toHaveBeenCalledOnce();
  resolve({}); await Promise.all([warmup, load]);
});
it.each([true, false])("terminates the OCR engine even when recognition fails: %s", async fails => {
  const terminate = vi.fn().mockResolvedValue(undefined);
  const recognize = fails ? vi.fn().mockRejectedValue(new Error("OCR failed")) : vi.fn().mockResolvedValue({ data: { text: "Nasi 12000" } });
  mocks.createWorker.mockResolvedValue({ recognize, terminate });
  await import("@/workers/ocr.worker");
  await (self.onmessage as any)({ data: { type: "RECOGNIZE_RECEIPT", payload: { image: "receipt" } } });
  expect(terminate).toHaveBeenCalledOnce();
  expect(self.postMessage).toHaveBeenCalledWith(expect.objectContaining({ success: !fails }));
});

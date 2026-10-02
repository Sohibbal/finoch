import { pipeline, env } from "@xenova/transformers";

// Konfigurasi transformers.js untuk eksekusi offline di peramban
env.allowLocalModels = false;
env.useBrowserCache = true;

// Arahkan WebAssembly ke host lokal /wasm/ agar 100% offline tanpa CDN jsdelivr
const workerOrigin =
  typeof self !== "undefined" && self.location && self.location.origin
    ? self.location.origin
    : "";
const wasmBase = workerOrigin ? `${workerOrigin}/wasm/` : "/wasm/";

if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.wasmPaths = wasmBase;
  env.backends.onnx.wasm.numThreads = 1;
}

class PipelineSingleton {
  static task = "automatic-speech-recognition" as const;
  static currentModel = "Xenova/whisper-base";
  static instance: any = null;

  static async getInstance(
    modelId?: string,
    progress_callback?: (data: any) => void
  ) {
    const targetModel = modelId || this.currentModel;
    if (this.instance === null || this.currentModel !== targetModel) {
      this.currentModel = targetModel;
      this.instance = await pipeline(this.task, targetModel, {
        progress_callback,
        quantized: true,
      });
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event: MessageEvent) => {
  const { type, audio, model, tier } = event.data || {};

  if (type === "load") {
    try {
      await PipelineSingleton.getInstance(model, (progress: any) => {
        self.postMessage({
          status: "progress",
          data: progress,
        });
      });
      self.postMessage({ status: "ready", data: { tier } });
    } catch (err: any) {
      self.postMessage({
        status: "error",
        error: err?.message || String(err),
      });
    }
  } else if (type === "warmup") {
    try {
      await PipelineSingleton.getInstance(model);
      self.postMessage({ status: "ready", data: { tier } });
    } catch {
      // Warmup silent fallback
    }
  } else if (type === "transcribe") {
    try {
      const transcriber = await PipelineSingleton.getInstance(model);
      self.postMessage({ status: "transcribing" });

      const output = await transcriber(audio, {
        language: "indonesian",
        task: "transcribe",
        temperature: 0.0,
        max_new_tokens: 128,
      });

      const rawText =
        output?.text || (typeof output === "string" ? output : "") || "";
      // Bersihkan special tokens seperti [BLANK_AUDIO] atau noise
      const cleanText = rawText.replace(/\[.*?\]/g, "").trim();
      self.postMessage({ status: "complete", output: cleanText });
    } catch (err: any) {
      self.postMessage({
        status: "error",
        error: err?.message || String(err),
      });
    }
  } else if (type === "delete") {
    PipelineSingleton.instance = null;
    self.postMessage({ status: "deleted" });
  }
});

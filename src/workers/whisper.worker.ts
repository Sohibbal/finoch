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
  static model = "Xenova/whisper-tiny";
  static instance: any = null;

  static async getInstance(progress_callback?: (data: any) => void) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
        quantized: true,
      });
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event: MessageEvent) => {
  const { type, audio } = event.data || {};

  if (type === "load") {
    try {
      await PipelineSingleton.getInstance((progress: any) => {
        self.postMessage({
          status: "progress",
          data: progress,
        });
      });
      self.postMessage({ status: "ready" });
    } catch (err: any) {
      self.postMessage({
        status: "error",
        error: err?.message || String(err),
      });
    }
  } else if (type === "warmup") {
    try {
      await PipelineSingleton.getInstance();
      self.postMessage({ status: "ready" });
    } catch {
      // Warmup silent fallback
    }
  } else if (type === "transcribe") {
    try {
      const transcriber = await PipelineSingleton.getInstance();
      self.postMessage({ status: "transcribing" });

      const output = await transcriber(audio, {
        language: "indonesian",
        task: "transcribe",
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

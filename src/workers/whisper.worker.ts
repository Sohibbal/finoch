import { pipeline, env } from "@xenova/transformers";

// Konfigurasi transformers.js untuk eksekusi offline di peramban
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static task = "automatic-speech-recognition" as const;
  static model = "Xenova/whisper-tiny";
  static instance: any = null;

  static async getInstance(progress_callback?: (data: any) => void) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
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
  } else if (type === "transcribe") {
    try {
      const transcriber = await PipelineSingleton.getInstance();
      self.postMessage({ status: "transcribing" });

      const output = await transcriber(audio, {
        language: "indonesian",
        task: "transcribe",
      });

      const text =
        output?.text || (typeof output === "string" ? output : "") || "";
      self.postMessage({ status: "complete", output: text.trim() });
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

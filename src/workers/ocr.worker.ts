import { parseReceiptText } from "../lib/ocr/receipt-parser";

interface OcrWorkerMessage {
  type: "RECOGNIZE_RECEIPT";
  payload: {
    image: Blob | string;
    rawText?: string;
  };
}

self.onmessage = async (e: MessageEvent<OcrWorkerMessage>) => {
  const { type, payload } = e.data;
  if (type === "RECOGNIZE_RECEIPT") {
    try {
      if (payload.rawText) {
        const candidate = parseReceiptText(payload.rawText);
        self.postMessage({ success: true, candidate });
        return;
      }

      // If image is passed, attempt in-worker Tesseract.js if available or fallback
      let recognizedText = "";
      try {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("ind");
        const ret = await worker.recognize(payload.image);
        recognizedText = ret.data.text;
        await worker.terminate();
      } catch (err: unknown) {
        // Fallback when tesseract offline wasm worker is unavailable
        const message = err instanceof Error ? err.message : "Tesseract unavailable";
        self.postMessage({
          success: false,
          error: `Offline OCR failed: ${message}`,
          candidate: parseReceiptText(""),
        });
        return;
      }

      const candidate = parseReceiptText(recognizedText);
      self.postMessage({ success: true, candidate, rawText: recognizedText });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown OCR error";
      self.postMessage({ success: false, error: message });
    }
  }
};

import { NextResponse } from "next/server";
import { jakartaDate } from "../../validation";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { getLlmConfig } from "@/lib/llm/llm-client";
import { parseReceiptText } from "@/lib/ocr/receipt-parser";
import { TransactionCandidate } from "@/types/financial-types";
import Tesseract from "tesseract.js";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

async function runPaddleOcrSubprocess(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "paddle_ocr.py");
    const py = spawn("python", [pythonScript, filePath], {
      timeout: 15000,
    });

    let stdoutData = "";
    let stderrData = "";

    py.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        // Fallback gracefully on subprocess error
        resolve("");
        return;
      }
      try {
        const parsed = JSON.parse(stdoutData.trim());
        if (parsed.success && Array.isArray(parsed.lines)) {
          const fullText = parsed.lines
            .map((l: { text: string }) => l.text)
            .join("\n");
          resolve(fullText);
        } else {
          resolve("");
        }
      } catch {
        resolve(stdoutData);
      }
    });

    py.on("error", () => {
      resolve("");
    });
  });
}

async function parseWithLlm(rawText: string): Promise<TransactionCandidate | null> {
  const llmConfig = getLlmConfig();
  if (!llmConfig) return null;

  try {
    const prompt = `Anda adalah asisten AI ekstraksi struk belanja untuk aplikasi Finoch.
Ekstrak data dari teks OCR struk berikut ke dalam format JSON valid tanpa format markdown (hanya raw JSON):
{
  "merchant": "Nama Toko / Resto",
  "amount": 25000,
  "category": "Food & Drinks",
  "date": "2026-10-12",
  "items": [{"name": "Ayam Bg Kumis", "amount": 25000}]
}
Aturan Ekstraksi:
1. "merchant": Nama toko atau restoran yang bersih (contoh: "Mie Gacoan", "Indomaret", "Kopi Kenangan"). Jangan sertakan alamat panjang, no telp, atau no struk.
2. "amount": Total nominal yang dibayarkan pelanggan (angka bulat positif).
3. "category": Pilih PERSIS dari salah satu 5 kategori berikut:
- Food & Drinks (makanan, minuman, resto, warteg, kafe, jajan, sembako harian)
- Transportation (bensin, tiket kereta/bus, parkir, tol)
- Bills & Utilities (sewa kos, listrik, air, pulsa, kuota, internet)
- Shopping & Lifestyle (baju, celana, sepatu, skincare, belanja olshop, bioskop, hiburan)
- Other (kuliah/buku/print, obat/kesehatan, kirim uang keluarga, kado, sedekah, lainnya)
4. "date": Format YYYY-MM-DD (jika tidak terbaca, gunakan hari ini: ${jakartaDate()}).
5. "items": Daftar barang yang dibeli dengan nama barang yang bersih dan mudah dibaca (buang kode barcode atau singkatan kasir acak).

Teks OCR Struk:
${rawText}`;

    const candidateModels = Array.from(
      new Set([llmConfig.model, ...(llmConfig.fallbackModels || [])])
    );

    for (const candidateModel of candidateModels.slice(0, 3)) {
      try {
        const res = await fetch(`${llmConfig.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${llmConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: candidateModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          continue;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) continue;

        const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return {
          merchant: parsed.merchant || "Struk Belanja",
          amount: Number(parsed.amount) || 0,
          category: parsed.category || "Other",
          spendingType: parsed.spendingType || "wants",
          date: parsed.date || jakartaDate(),
          source: "ocr",
          confidence: 0.95,
          items: Array.isArray(parsed.items) ? parsed.items : [],
        };
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let tempFilePath: string | null = null;

  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (Number(req.headers.get("content-length")) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran berkas struk maksimal 10 MB." }, { status: 413 });
    }
    const formData = await req.formData().catch(() => null);
    if (!formData) return NextResponse.json({ error: "Form tidak valid." }, { status: 400 });
    const file = formData.get("image") as File | null;
    const directText = formData.get("text") as string | null;

    if (directText !== null && (typeof directText !== "string" || directText.length > 20000)) {
      return NextResponse.json({ error: "Teks struk maksimal 20000 karakter." }, { status: 400 });
    }

    // Handle direct text payload (e.g. from client-side OCR worker)
    if (directText) {
      const candidate = parseReceiptText(directText);
      return NextResponse.json({ candidate, source: "client_ocr" }, { status: 200 });
    }

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Gambar struk tidak ditemukan dalam permintaan." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas struk maksimal 10 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ocrText = "";

    // 1. Primary Engine: PaddleOCR via Python subprocess
    try {
      const tempFileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;
      tempFilePath = path.join(os.tmpdir(), tempFileName);
      await fs.writeFile(tempFilePath, buffer);
      const paddleText = await runPaddleOcrSubprocess(tempFilePath);
      if (paddleText && paddleText.trim().length > 0) {
        ocrText = paddleText.trim();
      }
    } catch (paddleErr) {
      console.warn("PaddleOCR notice:", paddleErr);
    }

    // 2. Secondary Engine: Tesseract.js (Node.js fallback with safe explicit workerPath)
    if (!ocrText || ocrText.length < 5) {
      let worker: Awaited<ReturnType<typeof Tesseract.createWorker>> | undefined;
      try {
        const workerPath = path.join(
          process.cwd(),
          "node_modules",
          "tesseract.js",
          "src",
          "worker-script",
          "node",
          "index.js"
        );
        worker = await Tesseract.createWorker("eng", 1, { workerPath });
        const tessRes = await worker.recognize(buffer);
        if (tessRes?.data?.text && tessRes.data.text.trim().length > ocrText.length) {
          ocrText = tessRes.data.text.trim();
        }
      } catch (tessErr) {
        console.warn("Tesseract OCR notice:", tessErr);
      } finally {
        await worker?.terminate().catch((error) => console.warn("Tesseract cleanup:", error));
      }
    }

    // 3. Extract transaction details via LLM
    let candidate: TransactionCandidate | null = null;
    if (ocrText && ocrText.trim().length > 3) {
      candidate = await parseWithLlm(ocrText);
    }

    // 4. Fallback to deterministic regex parser
    if (!candidate) {
      candidate = parseReceiptText(ocrText || "");
    }

    return NextResponse.json({
      candidate,
      rawText: ocrText,
      source: ocrText ? "ocr_pipeline" : "empty_ocr",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses gambar struk." },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch {
        // Ignore file cleanup error
      }
    }
  }
}

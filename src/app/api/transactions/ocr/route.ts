import { NextResponse } from "next/server";
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
    const prompt = `Anda adalah asisten ekstraksi data struk belanja finansial untuk aplikasi FINRA.
Ekstrak data dari teks OCR struk berikut ke dalam format JSON valid tanpa format markdown (hanya raw JSON):
{
  "merchant": "Nama Toko / Resto",
  "amount": 25000,
  "category": "Food & Drinks",
  "date": "2026-10-02",
  "items": [{"name": "Nama Item", "amount": 10000}]
}
Pilih category PERSIS dari salah satu 9 kategori berikut:
- Food & Drinks (makan resto/warteg, jajan kopi, sembako)
- Transportation (bensin, ojek online, tiket/parkir)
- Housing & Bills (sewa kos, listrik, air, pulsa/internet)
- Shopping & Clothing (baju, sepatu, skincare, belanja barang)
- Entertainment & Leisure (bioskop, streaming, game, rekreasi)
- Education & Career (kuliah, buku, print tugas, kursus)
- Health & Personal Care (obat, dokter, perawatan diri)
- Social & Family (kirim uang keluarga, kado, sedekah)
- Other (biaya administrasi atau lainnya)

Teks OCR Struk:
${rawText}`;

    const candidateModels = Array.from(
      new Set([llmConfig.model, ...(llmConfig.fallbackModels || [])])
    );

    for (const candidateModel of candidateModels) {
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
          if (res.status === 404) continue;
          return null;
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
          date: parsed.date || new Date().toISOString().split("T")[0],
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

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const directText = formData.get("text") as string | null;

    // Handle direct text payload (e.g. from client-side OCR worker)
    if (directText) {
      const candidate = parseReceiptText(directText);
      return NextResponse.json({ candidate, source: "client_ocr" }, { status: 200 });
    }

    if (!file) {
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

    // 1. Primary Engine: Tesseract.js in Node.js
    try {
      const tessRes = await Tesseract.recognize(buffer, "eng");
      if (tessRes?.data?.text && tessRes.data.text.trim().length > 0) {
        ocrText = tessRes.data.text.trim();
      }
    } catch (tessErr) {
      console.warn("Tesseract OCR notice:", tessErr);
    }

    // 2. Secondary fallback: PaddleOCR subprocess (if available)
    if (!ocrText || ocrText.length < 5) {
      try {
        const tempFileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;
        tempFilePath = path.join(os.tmpdir(), tempFileName);
        await fs.writeFile(tempFilePath, buffer);
        const paddleText = await runPaddleOcrSubprocess(tempFilePath);
        if (paddleText && paddleText.trim().length > ocrText.length) {
          ocrText = paddleText.trim();
        }
      } catch (paddleErr) {
        console.warn("PaddleOCR notice:", paddleErr);
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

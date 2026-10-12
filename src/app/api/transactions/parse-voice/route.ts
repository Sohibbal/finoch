import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { EXPENSE_CATEGORIES } from "../../validation";
import { getLlmConfig } from "@/lib/llm/llm-client";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import type { ParsedVoiceItem } from "@/lib/types/expense";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }
    const { transcript } = body;

    if (typeof transcript === "string" && transcript.length > 1000) {
      return NextResponse.json({ error: "Transkrip maksimal 1000 karakter." }, { status: 400 });
    }

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json({ items: [], source: "empty" });
    }

    const cleanTranscript = transcript.trim();
    const llmConfig = getLlmConfig();

    if (llmConfig) {
      const candidateModels = Array.from(
        new Set([llmConfig.model, ...(llmConfig.fallbackModels || [])])
      );

      const prompt = `Anda adalah asisten AI ekstraksi transaksi pengeluaran dan pemasukan untuk Finoch.
Ekstrak transaksi dari transkrip ucapan berikut ke dalam format JSON valid tanpa format markdown (hanya raw JSON):
{
  "items": [
    {
      "itemName": "Ayam Bg Kumis",
      "amount": 25000,
      "category": "Food & Drinks"
    }
  ]
}
Aturan Penting:
1. Field "itemName" HANYA boleh berisi NAMA ITEM / MAKANAN / BARANG / SUMBER TRANSAKSI intinya saja yang bersih.
2. WAJIB buang seluruh kata awalan percakapan, subjek, kata kerja umum, dan keterangan waktu seperti "hari ini saya makan", "tadi pagi beli", "kemarin jajan", "barusan bayar", dsb.
Contoh:
- "hari ini saya makan ayam bg kumis 25 ribu" -> itemName: "Ayam Bg Kumis", amount: 25000
- "tadi pagi beli bensin pertalite 30rb" -> itemName: "Bensin Pertalite", amount: 30000
- "kemarin jajan es teh poci lima ribu" -> itemName: "Es Teh Poci", amount: 5000
- "barusan bayar kosan delapan ratus ribu" -> itemName: "Kosan", amount: 800000
3. Jika kalimat berisi lebih dari 1 pengeluaran (misal: "beli nasi padang 20 ribu sama es teh 5 ribu"), pisahkan menjadi beberapa objek di array items.
4. Nominal amount harus berupa angka bulat Rupiah (contoh: 20000).
5. Pilih category PERSIS dari salah satu 5 kategori berikut:
- Food & Drinks (makanan, minuman, resto, warteg, kafe, jajan, sembako harian)
- Transportation (bensin, ojol, tiket kereta/bus, parkir, tol)
- Bills & Utilities (sewa kos, listrik, air, pulsa, kuota, paket data, internet wifi)
- Shopping & Lifestyle (baju, celana, sepatu, belanja olshop, skincare, game, bioskop, hiburan)
- Other (kuliah/buku/print, obat/kesehatan, kirim uang keluarga, kado, sedekah, lainnya)

Transkrip Ucapan:
"${cleanTranscript}"`;

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
            continue;
          }

          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (!content) continue;

          const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const mappedItems: ParsedVoiceItem[] = parsed.items
              .filter((it: { amount?: unknown } | null) => it && typeof it.amount === "number" && Number.isFinite(it.amount) && it.amount > 0)
              .map((it: { itemName: string; amount: number; category: string }, idx: number) => {
                let cleanName = typeof it.itemName === "string" ? it.itemName.trim() : "Pengeluaran";
                // Strip lingering filler prefixes if model accidentally left them
                cleanName = cleanName
                  .replace(/^(?:hari\s+ini\s+)?(?:saya\s+|aku\s+|gua\s+|gue\s+)?(?:makan|minum|beli|bayar|jajan|buat|untuk)\s+/i, "")
                  .trim();
                if (!cleanName) cleanName = "Pengeluaran";

                return {
                  id: `voice-llm-${Date.now()}-${idx}`,
                  rawText: cleanTranscript,
                  itemName: cleanName.slice(0, 200),
                  amount: Number(it.amount) || 0,
                  category: EXPENSE_CATEGORIES.includes(it.category) ? it.category : "Other",
                  confidence: 0.95,
                };
              });

            return NextResponse.json({
              items: mappedItems,
              source: "llm",
              model: candidateModel,
            });
          }
        } catch {
          continue;
        }
      }
    }

    // Fallback to local Indonesian NLP parser
    const localItems = parseIndonesianExpense(cleanTranscript);
    return NextResponse.json({
      items: localItems,
      source: "local_nlp",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses transkrip ucapan" },
      { status: 500 }
    );
  }
}

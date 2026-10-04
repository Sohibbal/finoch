import { NextResponse } from "next/server";
import { getLlmConfig } from "@/lib/llm/llm-client";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import type { ParsedVoiceItem } from "@/lib/types/expense";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json({ items: [], source: "empty" });
    }

    const cleanTranscript = transcript.trim();
    const llmConfig = getLlmConfig();

    if (llmConfig) {
      const candidateModels = Array.from(
        new Set([llmConfig.model, ...(llmConfig.fallbackModels || [])])
      );

      const prompt = `Anda adalah asisten ekstraksi transaksi pengeluaran FINRA.
Ekstrak pengeluaran dari transkrip ucapan berikut ke dalam format JSON valid tanpa format markdown (hanya raw JSON):
{
  "items": [
    {
      "itemName": "Nasi Padang",
      "amount": 20000,
      "category": "Food & Drinks"
    }
  ]
}
Aturan:
1. Jika kalimat berisi lebih dari 1 pengeluaran (misal: "beli nasi padang 20 ribu sama bensin 15 ribu"), pisahkan menjadi beberapa objek di array items.
2. Nominal amount harus berupa angka bulat Rupiah (contoh: 20000).
3. Pilih category PERSIS dari salah satu 5 kategori berikut:
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
            if (res.status === 404) continue;
            break;
          }

          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (!content) continue;

          const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const mappedItems: ParsedVoiceItem[] = parsed.items.map(
              (it: { itemName: string; amount: number; category: string }, idx: number) => ({
                id: `voice-llm-${Date.now()}-${idx}`,
                rawText: cleanTranscript,
                itemName: it.itemName || "Pengeluaran",
                amount: Number(it.amount) || 0,
                category: it.category || "Other",
                confidence: 0.95,
              })
            );

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

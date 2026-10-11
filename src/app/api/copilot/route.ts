import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { getLlmConfig } from "@/lib/llm/llm-client";
import {
  buildUserFinancialSnapshot,
  type UserFinancialSnapshot,
} from "@/lib/copilot/context-builder";
import { buildCopilotSystemPrompt } from "./prompt-builder";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }
    const { message } = body;

    if (typeof message !== "string" || !message.trim() || message.length > 2000) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Grounding on live database snapshot
    const facts: UserFinancialSnapshot = await buildUserFinancialSnapshot(session.userId);
    const systemPrompt = buildCopilotSystemPrompt(facts);
    const llmConfig = getLlmConfig();

    if (llmConfig) {
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
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
              ],
              temperature: 0.5,
            }),
            signal: AbortSignal.timeout(15000),
          });

          if (res.ok) {
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content?.trim();
            if (reply) {
              return NextResponse.json({
                reply,
                source: "llm",
                model: candidateModel,
                provider: llmConfig.provider,
              });
            }
          } else {
            const errorText = await res.text();
            console.warn(
              `[Copilot LLM ${candidateModel} Error ${res.status}]`,
              errorText
            );
            if (res.status === 404 || errorText.includes("does not exist")) {
              continue;
            }
            break;
          }
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : "Network/Timeout error";
          console.error(`[Copilot LLM ${candidateModel} Exception]`, errorMsg);
          break;
        }
      }
    }

    // Gen-Z Deterministic fallback response grounded strictly on facts
    const lower = message.toLowerCase();
    const name = facts.nickname || "Kawan";
    const rupiah = (n: number) => `Rp${(n || 0).toLocaleString("id-ID")}`;

    let reply = `Halo ${name}! Nih rangkuman cepat dari database lo: Saldo bersih saat ini ${rupiah(facts.netBalance)}, pemasukan bulan ini ${rupiah(facts.monthlyIncome)}, dan pengeluaran ${rupiah(facts.monthlyExpense)}.`;

    if (lower.includes("boros") || lower.includes("kategori") || lower.includes("makan") || lower.includes("jajan")) {
      reply = `Berdasarkan database lo nih ${name}, pos yang paling banyak menyedot pengeluaran ada di ${facts.topExpenseCategory || "pengeluaran harian"}. Biar gak boncos, rem dulu nongkrong gak penting ya!`;
    } else if (lower.includes("wishlist") || lower.includes("beli") || lower.includes("target")) {
      reply = `Buat wishlist lo (${facts.wishlistSummary || "belum ada wishlist"}), saldo bersih lo sekarang ${rupiah(facts.netBalance)}. Selalu pastiin ada sisa buat dana darurat sebelum checkout barang incaran lo!`;
    } else if (lower.includes("aman") || lower.includes("kondisi") || lower.includes("hemat")) {
      if (facts.netBalance >= 0) {
        reply = `Kondisi finansial lo masih aman terkendali kok ${name}! Saldo surplus ${rupiah(facts.netBalance)}. Gass pertahanin streak hemat lo!`;
      } else {
        reply = `Waduh ${name}, pengeluaran lo bulan ini udah melebihi pemasukan (-${rupiah(Math.abs(facts.netBalance))}). Waktunya pasang rem belanja darurat nih!`;
      }
    }

    return NextResponse.json({
      reply,
      source: "facts_fallback",
    });
  } catch (error) {
    console.error("Copilot route error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pesan Copilot" },
      { status: 500 }
    );
  }
}

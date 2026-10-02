import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { buildCopilotSystemPrompt, FinancialFacts } from "./prompt-builder";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { message, facts } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const defaultFacts: FinancialFacts = {
      monthlyIncome: 3500000,
      monthlyExpense: 2300000,
      netSavings: 1200000,
      topCategory: "Food (Rp920.000)",
      goalName: "Beli Laptop Kerja",
      goalStatus: "on_track",
    };

    const activeFacts: FinancialFacts = facts || defaultFacts;
    const systemPrompt = buildCopilotSystemPrompt(activeFacts);

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (apiKey) {
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
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
            return NextResponse.json({ reply, source: "llm" });
          }
        }
      } catch {
        // Fallback to rule-based fact generator on LLM timeout/error
      }
    }

    // Deterministic fallback response based on financial facts
    const lower = message.toLowerCase();
    let reply = `Berdasarkan model Digital Twin Anda, penghasilan Anda adalah Rp${activeFacts.monthlyIncome.toLocaleString("id-ID")} dengan pengeluaran Rp${activeFacts.monthlyExpense.toLocaleString("id-ID")}. Tabungan bersih saat ini Rp${activeFacts.netSavings.toLocaleString("id-ID")}/bulan.`;

    if (lower.includes("turun") || lower.includes("tabungan")) {
      reply = `Tabungan bulanan Anda saat ini sebesar Rp${activeFacts.netSavings.toLocaleString("id-ID")}. Faktor pengeluaran terbesar berasal dari kategori ${activeFacts.topCategory}. Jika ingin meningkatkan tabungan hingga mencapai target 20%+, coba pangkas jajan non-esensial sebesar Rp200.000 melalui What-If Simulator!`;
    } else if (lower.includes("laptop") || lower.includes("beli") || lower.includes("aman")) {
      reply = `Target goal "${activeFacts.goalName}" Anda berstatus [${activeFacts.goalStatus}]. Dengan kapasitas tabungan Rp${activeFacts.netSavings.toLocaleString("id-ID")}/bulan, disarankan tidak membeli secara tunai jika menghabiskan dana darurat. Simulasikan penyesuaian anggaran di menu Simulator untuk melihat tanggal amannya!`;
    } else if (lower.includes("makan") || lower.includes("food") || lower.includes("gacoan")) {
      reply = `Pos pengeluaran konsumsi Anda saat ini adalah yang tertinggi: ${activeFacts.topCategory}. Di model 50/30/20, makan pokok termasuk Kebutuhan (Needs), namun jajan kafe/resto termasuk Keinginan (Wants). Pastikan porsi Wants tidak melampaui 30% dari income Anda.`;
    }

    return NextResponse.json({ reply, source: "facts_fallback" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses pesan Copilot" },
      { status: 500 }
    );
  }
}

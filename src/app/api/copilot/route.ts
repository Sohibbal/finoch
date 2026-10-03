import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { getLlmConfig } from "@/lib/llm/llm-client";
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

    let activeFacts: FinancialFacts = facts || defaultFacts;

    // Load real facts from user profile & database if authenticated and facts not explicitly passed
    if (session?.userId && !facts) {
      try {
        const [profile, expenses, goals] = await Promise.all([
          prisma.financialProfile.findUnique({ where: { userId: session.userId } }),
          prisma.expense.findMany({ where: { userId: session.userId, isDeleted: false } }),
          prisma.financialGoal.findMany({ where: { userId: session.userId } }),
        ]);

        if (profile) {
          const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
          const catMap = expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
          }, {} as Record<string, number>);
          const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
          const topCatLabel = topCat
            ? `${topCat[0]} (Rp${topCat[1].toLocaleString("id-ID")})`
            : "Konsumsi Harian";

          activeFacts = {
            monthlyIncome: profile.monthlyIncome,
            monthlyExpense: totalExpense,
            netSavings: Math.max(0, profile.monthlyIncome - totalExpense),
            topCategory: topCatLabel,
            goalName: goals[0]?.name || "Tabungan Impian",
            goalStatus: goals[0]?.status || "on_track",
          };
        }
      } catch (dbErr) {
        console.warn("Could not query user facts from DB for Copilot:", dbErr);
      }
    }

    const systemPrompt = buildCopilotSystemPrompt(activeFacts);
    const llmConfig = getLlmConfig();
    let llmErrorMessage: string | null = null;

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
            llmErrorMessage = `HTTP ${res.status}: ${errorText.slice(0, 150)}`;
            // If model does not exist (404), continue trying next candidate
            if (res.status === 404 || errorText.includes("does not exist")) {
              continue;
            }
            break;
          }
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : "Network/Timeout error";
          console.error(`[Copilot LLM ${candidateModel} Exception]`, errorMsg);
          llmErrorMessage = errorMsg;
          break;
        }
      }
    } else {
      llmErrorMessage = "OPENAI_API_KEY belum terdeteksi. Pastikan file .env ada dan restart npm run dev.";
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

    return NextResponse.json({
      reply,
      source: "facts_fallback",
      llmDiagnostic: llmErrorMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses pesan Copilot" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { jakartaDate } from "../validation";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { getLlmConfig } from "@/lib/llm/llm-client";
import { buildCopilotSystemPrompt, FinancialFacts } from "./prompt-builder";

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

    const defaultFacts: FinancialFacts = {
      monthlyIncome: 0,
      monthlyExpense: 0,
      netSavings: 0,
      topCategory: "Belum ada pengeluaran",
      goalName: "Belum ada target",
      goalStatus: "on_track",
    };

    let activeFacts: FinancialFacts = defaultFacts;

    // Only server-owned facts may enter the system prompt.
    if (session.userId) {
      try {
        const [year, month] = jakartaDate().split("-").map(Number);
        const monthStart = new Date(Date.UTC(year, month - 1, 1) - 7 * 60 * 60 * 1000);
        const nextMonth = new Date(Date.UTC(year, month, 1) - 7 * 60 * 60 * 1000);
        const [profile, expenses, goals] = await Promise.all([
          prisma.financialProfile.findUnique({ where: { userId: session.userId } }),
          prisma.expense.findMany({ where: { userId: session.userId, isDeleted: false, createdAt: { gte: monthStart, lt: nextMonth } } }),
          prisma.financialGoal.findMany({ where: { userId: session.userId }, orderBy: [{ targetDate: "asc" }, { id: "asc" }] }),
        ]);

        {
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
            monthlyIncome: profile?.monthlyIncome ?? 0,
            monthlyExpense: totalExpense,
            netSavings: Math.max(0, (profile?.monthlyIncome ?? 0) - totalExpense),
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
          break;
        }
      }
    }

    // Deterministic fallback response based on financial facts
    const lower = message.toLowerCase();
    let reply = `Halo! Pemasukanmu saat ini Rp${activeFacts.monthlyIncome.toLocaleString("id-ID")} dan total pengeluaran Rp${activeFacts.monthlyExpense.toLocaleString("id-ID")}. Kamu masih punya sisa bersih Rp${activeFacts.netSavings.toLocaleString("id-ID")} bulan ini.`;

    if (lower.includes("turun") || lower.includes("tabungan")) {
      reply = `Sisa tabunganmu saat ini Rp${activeFacts.netSavings.toLocaleString("id-ID")}. Pos yang paling banyak menyedot pengeluaran ada di ${activeFacts.topCategory}. Coba kurangi sedikit pos jajan santai lewat What-If Simulator biar tabunganmu lebih tebal!`;
    } else if (lower.includes("laptop") || lower.includes("beli") || lower.includes("aman")) {
      reply = `Untuk target "${activeFacts.goalName}", statusmu saat ini [${activeFacts.goalStatus}] dengan sisa dana bulanan Rp${activeFacts.netSavings.toLocaleString("id-ID")}. Kalau mau beli sekarang, pastikan jangan sampai menguras dana daruratmu ya. Kamu bisa cek simulasinya di menu Simulator!`;
    } else if (lower.includes("makan") || lower.includes("food") || lower.includes("gacoan") || lower.includes("kopi")) {
      reply = `Pos pengeluaran makanan & minumanmu saat ini tercatat ${activeFacts.topCategory}. Ini memang pos paling dominan, jadi trik simpelnya cukup batasi jajan kopi/kafe di akhir pekan saja biar tetap hemat tanpa tersiksa.`;
    }

    return NextResponse.json({
      reply,
      source: "facts_fallback",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses pesan Copilot" },
      { status: 500 }
    );
  }
}

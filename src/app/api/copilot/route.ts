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
    let facts: UserFinancialSnapshot = await buildUserFinancialSnapshot(session.userId, body.clientFacts);
    if (body.clientFacts && facts.currentMonthIncome === 0 && facts.currentMonthExpense === 0 && facts.netBalance === 0) {
      facts = {
        ...facts,
        netBalance: typeof body.clientFacts.netBalance === "number" ? body.clientFacts.netBalance : facts.netBalance,
        monthlyIncome: typeof body.clientFacts.monthlyIncome === "number" ? body.clientFacts.monthlyIncome : facts.monthlyIncome,
        monthlyExpense: typeof body.clientFacts.monthlyExpense === "number" ? body.clientFacts.monthlyExpense : facts.monthlyExpense,
        currentMonthIncome: typeof body.clientFacts.monthlyIncome === "number" ? body.clientFacts.monthlyIncome : (facts.currentMonthIncome ?? facts.monthlyIncome),
        currentMonthExpense: typeof body.clientFacts.monthlyExpense === "number" ? body.clientFacts.monthlyExpense : (facts.currentMonthExpense ?? facts.monthlyExpense),
        topExpenseCategory: body.clientFacts.topExpenseCategory || facts.topExpenseCategory,
        wishlistSummary: body.clientFacts.wishlistSummary || facts.wishlistSummary,
        streakDays: typeof body.clientFacts.streakDays === "number" ? body.clientFacts.streakDays : facts.streakDays,
      };
    }
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
            const rawReply = data.choices?.[0]?.message?.content?.trim();
            if (rawReply) {
              const reply = rawReply.replace(/—/g, " - ");
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

    const curInc = facts.currentMonthIncome ?? facts.monthlyIncome ?? 0;
    const curExp = facts.currentMonthExpense ?? facts.monthlyExpense ?? 0;
    const curBal = curInc - curExp;
    const curMonthName = facts.currentMonthName || "bulan ini";
    const allInc = facts.allTimeIncome ?? facts.monthlyIncome ?? 0;
    const allExp = facts.allTimeExpense ?? facts.monthlyExpense ?? 0;
    const todayExp = facts.todayExpense ?? 0;
    const allowance = facts.dailyAllowance && facts.dailyAllowance > 0 ? facts.dailyAllowance : 50000;

    let reply = `Halo ${name}! Nih rangkuman cepat dari database lo: Saldo bersih saat ini ${rupiah(facts.netBalance)}, pemasukan bulan ini ${rupiah(facts.monthlyIncome)}, dan pengeluaran ${rupiah(facts.monthlyExpense)}. Lo bisa tanya detail pengeluaran per bulan, per kategori, atau wishlist lo!`;

    // 0. Today spending safety vs Daily Allowance target
    const isTodayQuery =
      lower.includes("hari ini") ||
      lower.includes("aman") ||
      lower.includes("boros") ||
      lower.includes("jatah");

    if (
      isTodayQuery &&
      (lower.includes("aman") ||
        lower.includes("boros") ||
        lower.includes("jatah") ||
        (lower.includes("hari ini") && lower.includes("pengeluaran")))
    ) {
      if (todayExp > allowance) {
        const boncos = todayExp - allowance;
        reply = `Pengeluaran hari ini (${rupiah(todayExp)}) sudah melebihi target jatah harian lo (${rupiah(allowance)}), jadi hari ini kurang aman karena boncos ${rupiah(boncos)}. Tapi tenang, tabungan atau saldo bersih total lo masih ada ${rupiah(facts.netBalance)}. Besok coba lebih ngerem belanja ya!`;
      } else {
        const sisa = allowance - todayExp;
        reply = `Pengeluaran hari ini (${rupiah(todayExp)}) masih aman di bawah target jatah harian lo (${rupiah(allowance)}). Sisa jatah hari ini masih ada ${rupiah(sisa)}, dan saldo bersih lo ${rupiah(facts.netBalance)}. Mantap, pertahanin terus!`;
      }
    } else {
      // 1. Specific month matching
      const monthKeywords = [
        "januari", "februari", "maret", "april", "mei", "juni",
        "juli", "agustus", "september", "oktober", "november", "desember"
      ];
      const foundMonthWord = monthKeywords.find((m) => lower.includes(m));

      // 2. All-time query flag
      const isAllTimeQuery =
        lower.includes("selama ini") ||
        lower.includes("seluruh waktu") ||
        lower.includes("akumulasi") ||
        lower.includes("total seluruh") ||
        lower.includes("sepanjang masa") ||
        (lower.includes("semua") && (lower.includes("pengeluaran") || lower.includes("transaksi")));

      // 3. Category matching
      const matchedCategory = facts.categoryBreakdownAllTime?.find((c) => {
        const cLower = c.category.toLowerCase();
        if (lower.includes(cLower)) return true;
        if (cLower.includes("makan") && (lower.includes("makan") || lower.includes("kuliner") || lower.includes("food") || lower.includes("jajan") || lower.includes("minum"))) return true;
        if (cLower.includes("transport") && (lower.includes("transport") || lower.includes("bensin") || lower.includes("ojol") || lower.includes("parkir"))) return true;
        if (cLower.includes("belanja") && (lower.includes("belanja") || lower.includes("shopping") || lower.includes("mall"))) return true;
        if (cLower.includes("tagihan") && (lower.includes("tagihan") || lower.includes("listrik") || lower.includes("pulsa") || lower.includes("wifi") || lower.includes("air"))) return true;
        if (cLower.includes("hiburan") && (lower.includes("hiburan") || lower.includes("nonton") || lower.includes("game"))) return true;
        return false;
      });

    if (foundMonthWord) {
      const matchedMonth = facts.monthlyBreakdown?.find(
        (m) =>
          m.monthName.toLowerCase().includes(foundMonthWord) ||
          m.monthKey.toLowerCase().includes(foundMonthWord)
      );
      if (matchedMonth) {
        reply = `Berdasarkan database lo untuk ${matchedMonth.monthName}: total pengeluaran sebesar ${rupiah(matchedMonth.expense)}, dan pemasukan sebesar ${rupiah(matchedMonth.income)}.${matchedMonth.topCategory ? ` Pengeluaran terbesarnya di ${matchedMonth.topCategory}.` : ""} Selisih bersih bulan itu: ${rupiah(matchedMonth.income - matchedMonth.expense)}.`;
      } else {
        const available = facts.monthlyBreakdown?.map((m) => m.monthName).join(", ");
        reply = `Di database belum ada catatan transaksi untuk bulan ${foundMonthWord} nih ${name}.${available ? ` Bulan yang tercatat baru: ${available}.` : ""}`;
      }
    } else if (matchedCategory) {
      if (lower.includes("bulan ini") || lower.includes("sekarang")) {
        const curCat = facts.categoryBreakdownCurrentMonth?.find(
          (c) => c.category.toLowerCase() === matchedCategory.category.toLowerCase()
        );
        if (curCat) {
          reply = `Pengeluaran lo untuk kategori "${curCat.category}" khusus di ${curMonthName} tercatat sebesar ${rupiah(curCat.amount)} (${curCat.count}x transaksi).`;
        } else {
          reply = `Khusus di ${curMonthName}, belum ada catatan pengeluaran untuk kategori "${matchedCategory.category}". Total selama ini untuk kategori ini ada di ${rupiah(matchedCategory.amount)}.`;
        }
      } else {
        reply = `Untuk kategori "${matchedCategory.category}", total pengeluaran lo yang tercatat di database sebesar ${rupiah(matchedCategory.amount)} dari total ${matchedCategory.count} kali transaksi. ${matchedCategory.amount > 1000000 ? "Lumayan berasa nih, jangan lupa dikontrol ya!" : "Masih dalam batas aman kok, mantap!"}`;
      }
    } else if (isAllTimeQuery) {
      reply = `Total akumulasi pengeluaran lo selama ini (seluruh waktu di database) adalah ${rupiah(allExp)}, dengan total pemasukan ${rupiah(allInc)}. Sisa saldo bersih lo saat ini ${rupiah(facts.netBalance)}.`;
    } else if (lower.includes("masuk") || lower.includes("income") || lower.includes("gaji") || lower.includes("pendapatan")) {
      reply = `Total pemasukan lo ${curMonthName} tercatat sebesar ${rupiah(curInc)}. Dengan pengeluaran ${rupiah(curExp)}, saldo surplus bulan ini sebesar ${rupiah(curBal)}. Total saldo lo saat ini ${rupiah(facts.netBalance)}. Mantap, kawal terus tabungan lo!`;
    } else if (lower.includes("keluar") || lower.includes("expense") || (lower.includes("pengeluaran") && !lower.includes("pemasukan"))) {
      reply = `Total pengeluaran lo ${curMonthName} tercatat sebesar ${rupiah(curExp)}. Pos pengeluaran terbanyak ada di ${facts.currentMonthTopCategory || facts.topExpenseCategory || "pengeluaran harian"}. Selalu pantau jatah harian lo ya!`;
    } else if (lower.includes("saldo") || lower.includes("uang gue") || lower.includes("sisa uang")) {
      reply = `Saldo bersih lo saat ini tercatat sebesar ${rupiah(facts.netBalance)}. Untuk ${curMonthName}, pemasukan lo ${rupiah(curInc)} dan pengeluaran ${rupiah(curExp)}.`;
    } else if (lower.includes("wishlist") || lower.includes("beli") || lower.includes("target")) {
      reply = `Buat wishlist lo (${facts.wishlistSummary || "belum ada wishlist aktif"}), saldo bersih lo sekarang ${rupiah(facts.netBalance)}. Selalu pastiin ada sisa buat dana darurat sebelum checkout barang incaran lo!`;
    } else if (lower.includes("terakhir") || lower.includes("terbaru") || lower.includes("riwayat")) {
      if (facts.recentTransactions && facts.recentTransactions.length > 0) {
        const list = facts.recentTransactions.slice(0, 5).map((t) => `${t.date}: ${t.name} (${t.type === "income" ? "+" : "-"}${rupiah(t.amount)})`).join(", ");
        reply = `Ini transaksi terbaru yang tercatat di database lo: ${list}.`;
      } else {
        reply = `Belum ada riwayat transaksi yang tercatat di database nih ${name}.`;
      }
    } else if (lower.includes("aman") || lower.includes("kondisi") || lower.includes("hemat") || lower.includes("streak")) {
      if (facts.netBalance >= 0) {
        reply = `Kondisi finansial lo masih aman terkendali kok ${name}! Saldo surplus ${rupiah(facts.netBalance)}, dan streak disiplin lo udah ${facts.streakDays || 0} hari. Gass pertahanin streak hemat lo!`;
      } else {
        reply = `Waduh ${name}, pengeluaran lo saat ini udah melebihi pemasukan (-${rupiah(Math.abs(facts.netBalance))}). Waktunya pasang rem belanja darurat nih!`;
      }
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

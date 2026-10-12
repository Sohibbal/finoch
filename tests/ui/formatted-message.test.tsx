import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  sanitizeBotMessage,
  parseInlineMarkdown,
  renderFormattedMarkdown,
  FormattedBotMessage,
} from "@/components/copilot/formatted-message";

describe("FormattedBotMessage & Markdown Parsing", () => {
  it("sanitizes empty quadruple asterisks **** and redundant asterisks", () => {
    const raw = "Halo ****Budi****, cek **** nih!";
    const cleaned = sanitizeBotMessage(raw);
    expect(cleaned).not.toContain("****");
    expect(cleaned).toBe("Halo **Budi**, cek nih!");
  });

  it("limits excessive and consecutive emojis", () => {
    const raw = "Saldo aman 🚀🔥💰 Mantap banget! 🎉🥳 Gass pol 💸🤑";
    const cleaned = sanitizeBotMessage(raw);
    // Should collapse consecutive and limit to max 2 emojis
    expect(cleaned).toContain("Saldo aman");
    // Count emojis in cleaned
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu;
    const matches = cleaned.match(emojiRegex) || [];
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it("renders bold text as genuine <strong> elements without asterisks", () => {
    const html = renderToString(
      React.createElement(FormattedBotMessage, {
        text: "Saldo lo saat ini **Rp1.500.000**, pengeluaran **Rp300.000**.",
      })
    );

    expect(html).toContain("Rp1.500.000");
    expect(html).toContain('<strong class="font-bold text-slate-900 dark:text-white">Rp1.500.000</strong>');
    expect(html).toContain('<strong class="font-bold text-slate-900 dark:text-white">Rp300.000</strong>');
    expect(html).not.toContain("**");
  });

  it("renders bullet points with clean list indicators", () => {
    const html = renderToString(
      React.createElement(FormattedBotMessage, {
        text: "- Pemasukan: Rp 2.000.000\n- Pengeluaran: Rp 500.000",
      })
    );

    expect(html).toContain("Pemasukan: Rp 2.000.000");
    expect(html).toContain("Pengeluaran: Rp 500.000");
  });

  it("handles streaming unclosed bold tags without showing leading asterisks", () => {
    const inlineNodes = parseInlineMarkdown("Saldo lo **Rp1.5", true);
    const html = renderToString(React.createElement(React.Fragment, null, ...inlineNodes));
    expect(html).toContain('<strong class="font-bold text-slate-900 dark:text-white">Rp1.5</strong>');
    expect(html).not.toContain("**");
  });
});

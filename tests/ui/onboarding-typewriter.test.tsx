import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

describe("TypewriterCard Onboarding", () => {
  it("renders FinBot avatar and nickname form elements", async () => {
    const { TypewriterCard } = await import("@/components/onboarding/typewriter-card");
    const html = renderToString(<TypewriterCard onComplete={() => {}} />);
    expect(html).toContain("FinBot");
    expect(html).toContain("Mulai Berteman");
  });
});

---
version: 1
slug: "src-app-app-dashboard-page-tsx"
primary_target: "src/app/(app)/dashboard/page.tsx"
related_targets: ["src/app/(app)/layout.tsx","src/app/page.tsx"]
---

---
version: 1
slug: "src-app-app-dashboard-page-tsx"
primary_target: "src/app/(app)/dashboard/page.tsx"
related_targets: ["src/app/(app)/layout.tsx","src/app/page.tsx"]
---

# Surface brief: Finoch app (dashboard first) — "Lembar Rupiah" world

Scope: replacement visual world for the whole app (17 pages under src/app/(app), onboarding, login/register) and the landing page; dashboard is the first surface. Visitor mode: Operate (app); landing is Persuade within the same world.
Audience/job: anak kost checks "jatah hari ini" and logs a purchase in seconds, one-handed, often offline. Primary action: Catat (voice first, typed alternative).
Constraints: keep logo and navy/cream brand palette, keep all 17 features reachable (order/grouping may change), keep every existing function and data flow, no unmeasured claims, Indonesian copy in anak-kost voice.
Unresolved: exact display/body faces (chosen during foundation build, must not be Plus Jakarta Sans or another training-data default without a stated reason).

## Direction contract

THESIS: Money you can hold. Today's allowance is printed as one banknote-like sheet you read at a glance, not a grid of KPI cards. Refuses the fintech dashboard of equal-weight cards, chips and charts.

OWN-WORLD: Banknote grammar on brand colors: navy intaglio ink (#0B192C) on cream note paper (#F5EFE0); procedural guilloche rosettes and microtext lines as the only ornament; serial numbers on every sheet and transaction (FNC·DDMMYY·0042); a vertical security-thread stripe whose denomination color carries money status — Aman = green (#3E9B6B), Mepet = ochre (#B07A2A), Habis = red (#D2463C); blue (#2F6FB5) and violet (#7B4FA0) mark wallets/envelopes like note denominations. Hairline rules and registration marks replace nested cards, shadows, gradients, glows and colored icon tiles. Three type sizes plus one giant numeral face; 12px minimum. Never reproduce real Rupiah artwork (Garuda, BI marks, portraits).

STORY: The student sees one trustworthy number for today and its status, taps the seal to speak a purchase, and watches the note re-print with the new amount while a serial-numbered stub joins today's stack. Everything else (wallets as notes, envelopes as amplop, bills, kasbon) is printed from the same press.

FIRST VIEWPORT: Mobile 390px: thin header (logo, date, status stamp). The jatah note fills ~60% of the viewport: guilloche rosette left, "JATAH HARI INI" label, giant numeral (Rp small, amount at ~64–80px), serial number bottom-left, security-thread stripe in the status color, one line "Sisa bulan ini Rp X · N hari lagi". A large round "Catat" seal (≥72px) overlaps the note's bottom edge in thumb reach. Below: today's stubs, newest first. No other cards above the fold. Desktop: note at left two-thirds, today's stubs as a right column; sidebar in the same printed language.

FORM: "Lembar Rupiah" — banknote grammar; position 6 on the ordered list (1 warung signage, 2 nota warteg, 3 WhatsApp voice note, 4 buku kas, 5 mading kos, 6 uang kertas & amplop, 7 KTM/KRS); seed key c4a3c790. Raises: serial numbers per transaction (Factory catalog); state by form not hue — dashed = belum sinkron, struck = dihapus, doubled = melewati jatah (Emission rail); three type sizes, 12px min (Timetable); name plate + one-line personality per wallet/envelope (Character catalog); one status vocabulary Aman · Mepet · Habis · Tertunda sinkron (Transit diagram); hairlines instead of stacked cards (Design annual). Signature interaction: logging re-prints the note — the numeral rolls to the new amount, the rosette turns a few degrees, a stub slides into the stack (reduced motion: instant swap).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Decision (coordinator, after finish review round 1): on phones (<768px) the Catat seal lives at the center of the bottom tab bar instead of overlapping the note edge. Reason: it is the same thumb-zone position on every page, the note scrolls away while the bar does not, and one seal avoids two microphones on the dashboard. On md+ the seal overlaps the note edge as contracted.

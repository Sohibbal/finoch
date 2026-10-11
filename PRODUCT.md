# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Installable PWA (Next.js 15 App Router), used mostly on phones; desktop layout also supported.

## Users

Mahasiswa rantau / anak kost in Indonesia living on a monthly allowance (uang saku from parents or a scholarship). They pay kos rent and UKT, eat at warteg, split bills with friends, and run on mid-range Android phones with limited data. The job: know how much they can safely spend today and record spending in seconds, often one-handed at a counter or right after paying, so the allowance lasts until the end of the month ("krisis tanggal tua").

Secondary audience, near term: judges of a web development competition (see `docs/DEMO_JURI.md`) evaluating innovation, functionality, UI/UX, technical quality, responsiveness and the live demo.

## Product Purpose

A voice-first, local-first finance companion for anak kost. Success means a student logs spending by speaking casual Indonesian, trusts one clear "safe to spend today" number, and gets through the month without running out — and, first, that the product wins the competition and then ships to real students.

## Positioning

- Logging by speaking everyday Indonesian, including slang numbers ("goceng", "ceban", "dua setengah juta") and several items in one sentence, parsed on the device with an offline fallback.
- Works offline (local-first PWA) and syncs to the user's account when online.
- Built around anak-kost life rather than generic budgeting: kos & recurring bills, UKT sinking fund, split bill with PB1/service and WhatsApp messages, Buku Kasbon, wishlist cooling-off, masak vs warteg, "bocor halus" micro-leak audit, streak hemat, survival mode for tanggal tua.

## Operating Context

- Primary moment: right after buying something (warteg, parkir, es teh, top-up), phone in one hand, often on weak or no signal.
- Daily check: "jatah jajan hari ini" before going out.
- Monthly rhythms: allowance arrives, kos rent and UKT due dates, end-of-month squeeze.
- Social rituals: eating together then splitting the bill; collecting/settling kasbon over WhatsApp.
- Competition demo: presenter on a phone and laptop, airplane-mode offline demo, Mode Demo with sample data.

## Capabilities and Constraints

- 17 features, all of which must stay reachable in navigation (owner decision): dashboard, AI copilot, UKT sinking fund, masak vs warteg, split bill & talangan, buku kasbon, wishlist, streak hemat, multi-dompet, amplop anggaran, tagihan kost, audit bocor halus, laporan/LPJ, simulator arus kas, target finansial, insights, profil. Order and grouping may change.
- Logging paths: voice (Web Speech API online, Whisper WASM offline), receipt OCR (Tesseract / server), manual entry. Expenses charge a wallet; wallet balances are derived from opening balance, transfers and expenses.
- One allowance source: the user's financial profile from onboarding (income, fixed costs, savings).
- Every app page requires login; data is scoped per user on shared devices; expenses and feature data sync to the server.
- Mode Demo (Profil) fills the app with realistic sample data in a separate namespace that never syncs — used for presentations.
- Five expense categories: Food & Drinks, Transportation, Bills & Utilities, Shopping & Lifestyle, Other (stored in English; user-facing labels may be localized).
- Stack is fixed: Next.js 15, React 19, Tailwind CSS 3, Recharts, lucide-react icons.

## Brand Commitments

- Name: Finoch (finoch.id), "Financial Operations for Campus Habitat"; tagline in use: "Finansial Anak Kost Rapi Sekali Bicara".
- Logo and brand colors are binding (owner decision): logo assets in `public/finoch-logo*.svg`, `public/finoch-symbol*.svg`, `public/icons/`, sources in `logo-design/`; navy and cream brand palette.
- Voice: casual, warm Bahasa Indonesia that speaks like a fellow anak kost (warteg, kos, tanggal tua), never corporate.

## Evidence on Hand

- Real product content: voice example sentences, Indonesian slang number support, anak-kost advice copy (audit tips, Aturan Emas Anak Kost), split-bill PB1/service logic — in the codebase and README.
- Demo script: `docs/DEMO_JURI.md`.
- Automated test suite (539 tests) and working end-to-end flows verified in a browser.
- No measured performance or accuracy figures: "0.3 detik", "Akurasi 99.2%", "0 Byte", "100% offline" are unmeasured and must not be shown. No user testimonials, user counts, or press exist — do not fabricate any.

## Product Principles

1. One number to trust: there is a single, consistent "safe to spend today" figure; every total states its scope (hari ini / bulan ini).
2. Logging is the hero: recording a purchase takes seconds and one hand; speaking is the default path.
3. Speak anak kost: everyday Indonesian, local references, humor that helps rather than lectures.
4. Calm at money moments: warnings come with an amount and a next step, never contradictory alarms.
5. Demo-ready and real: every screen must work convincingly in Mode Demo and with an empty real account.

## Accessibility & Inclusion

Mobile-first on mid-range Android: touch targets ≥ 44px, readable text sizes (no 9–10px UI text), WCAG AA contrast, works on weak connections and offline, voice entry always has a typed alternative.

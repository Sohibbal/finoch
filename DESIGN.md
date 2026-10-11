---
name: Finoch
description: Lembar Rupiah. Today's allowance printed as one banknote-like sheet, navy intaglio ink on cream note paper.
colors:
  paper: "#F5EFE0"
  paper-sheet: "#FBF8F1"
  paper-deep: "#ECE4D0"
  ink: "#0B192C"
  ink-soft: "#46607F"
  aman: "#3E9B6B"
  aman-ink: "#2B7550"
  mepet: "#B07A2A"
  mepet-ink: "#8A5E1C"
  habis: "#D2463C"
  habis-ink: "#B4352C"
  denom-blue: "#2F6FB5"
  denom-violet: "#7B4FA0"
  denom-teal: "#1D6B73"
  denom-slate: "#4A5568"
  scrim: "#070E1A"
typography:
  numeral:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(3.5rem, 17vw, 5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
    fontVariation: "\"opsz\" auto"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.4rem"
  label:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.02em"
  stamp:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: "1rem"
    letterSpacing: "0.08em"
  serial:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    letterSpacing: "0.12em"
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
rounded:
  none: "0px"
  sm: "2px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-sheet}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  option-button:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  option-button-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-sheet}"
  input-field:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  note-sheet:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "32px 20px 24px"
  stub:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 12px 12px 16px"
  catat-seal:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-sheet}"
    typography: "{typography.stamp}"
    rounded: "{rounded.full}"
    size: "72px"
  status-stamp-aman:
    textColor: "{colors.aman-ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  status-stamp-mepet:
    textColor: "{colors.mepet-ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  status-stamp-habis:
    backgroundColor: "{colors.habis}"
    textColor: "{colors.paper-sheet}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  status-stamp-tertunda:
    textColor: "{colors.ink-soft}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  denom-note-blue:
    backgroundColor: "{colors.denom-blue}"
    textColor: "{colors.paper-sheet}"
    rounded: "{rounded.none}"
---

# Design System: Finoch

## Overview

**Creative North Star: "Lembar Rupiah"**

Money you can hold. Every surface is printed from one press: navy intaglio ink on cream note paper, hairline rules, corner registration marks, procedural guilloche rosettes and serial numbers. Today's allowance is a single banknote-like sheet with one giant engraved numeral, not a grid of equal-weight KPI cards. Wallets, envelopes and goals are notes in their own denomination color; transactions are serial-numbered stubs torn off the note; status is a rubber stamp and the color of the note's security thread.

Density is calm and ledger-like. Three text sizes and one numeral face carry the whole hierarchy, so a figure's importance is told by size and face, never by a colored tile or chip. State is told by form as well as hue (doubled, dashed, filled, struck) so nothing relies on color alone. Dark mode is the same note printed in reverse: cream ink on navy stock, still matte.

The world is banknote grammar, never banknote reproduction: no Garuda, Bank Indonesia marks, portraits or real Rupiah artwork. Rejected outright: the fintech dashboard of equal cards, chips and charts; gradients, glass, glow and drop shadows; nested cards.

**Key Characteristics:**
- One printed sheet per idea, flat paper with a 1px ink hairline and four registration corners.
- Bodoni Moda engraved figures for money and headings; Archivo for everything you read or tap.
- Green, ochre and red mean money status and nothing else.
- Every money figure states its scope in words next to it (hari ini, bulan ini, dari tagihan, dari profil).
- Guilloche rosettes and the wavy microtext rule are the only ornament.
- Logging re-prints the note: the numeral rolls, the rosette turns, a stub slides into the stack.

## Colors

Two inks on paper plus a status set and a denomination set; nothing else is allowed to carry hue.

### Primary
- **Intaglio Navy** (ink): all text, hairlines (at 15 to 30% alpha), registration marks, the primary button, the Catat seal, pressed options, focus outlines. Brand navy, binding.

### Secondary
- **Status Green, Aman** (aman / aman-ink): the security thread and stamp when today's jatah is safe. The bright value fills the thread; the -ink value is for text and stamp outlines on paper.
- **Status Ochre, Mepet** (mepet / mepet-ink): running low. Thread fill / text and doubled stamp outline.
- **Status Red, Habis** (habis / habis-ink): spent or over. Thread fill and the solid Habis stamp / text on paper.

### Tertiary
- **Denomination Blue, Violet, Teal, Slate** (denom-blue, denom-violet, denom-teal, denom-slate): the colors a wallet, amplop, kasbon slip or goal is printed in, as a flat field with paper-colored type. Stored legacy color names map onto these four; unknown names print slate. Each passes AA with paper type in both themes. Teal and slate switch to fixed lighter values in dark mode (#5FB3B9, #AEB8C6); blue and violet flip through their channels.

### Neutral
- **Note Paper** (paper): the page background, bottom bar and header. Brand cream, binding.
- **Printed Sheet** (paper-sheet): the surface of every Note, stub, field and dialog, and the type color on denomination fields and ink buttons.
- **Pressed Paper** (paper-deep): skeleton blocks and pressed areas only.
- **Soft Ink** (ink-soft): secondary text, meta lines, serials (5.6:1 on paper).
- **Scrim** (scrim at 50%): the flat overlay behind dialogs. No blur.

Dark theme reverses the stock: paper #08121F, sheet #0B192C, deep #102238, ink cream #F5EFE0, ink-soft #A9B8CC; status hues lift to #5BB487, #D19A46, #E36A60 and serve as both fill and text.

**The Status-Only Rule.** Green, ochre and red are reserved for Aman, Mepet and Habis. A wallet, envelope, goal, category or decoration never prints in them; it takes a denomination (blue, violet, teal, slate).

**The Two-Ink Rule.** Outside status and denominations, everything is ink or soft ink on paper. No Tailwind default palette, no tinted icon tiles.

## Typography

**Display Font:** Bodoni Moda (with Georgia, serif), optical-size axis on
**Body Font:** Archivo (with system-ui, sans-serif), width axis loaded

**Character:** High-contrast engraved figures like a banknote's denomination, against a sturdy grotesque that stays legible at 12px on a mid-range Android screen.

### Hierarchy
- **Numeral** (700, clamp(3.5rem, 17vw, 5rem), line-height 1, -0.03em, tabular lining): the one giant figure per sheet, e.g. sisa jatah hari ini. The "Rp" before it is set in the headline size.
- **Headline** (Bodoni Moda 700, 22px / 28px): page titles, section titles, dialog titles, note name plates, and the "Rp" prefix.
- **Body** (Archivo 400 to 700, 15px / 22.4px): everything read: sentences, list items, amounts in lists, buttons, fields. Prose capped at max-w-prose.
- **Label / Meta** (Archivo 600, 12px / 16px, +0.02em): field labels, meta lines under items, subtitles, tab labels.
- **Stamp** (Archivo 700, 12px, uppercase, +0.08em): only inside a rubber stamp or the Catat seal.
- **Serial** (Archivo 400, 12px, +0.12em, tabular): FNC·DDMMYY·NNNN on every note and stub.

**The Three Sizes Rule.** Meta 12, body 15, head 22, plus the clamp numeral. Nothing else in the app, and nothing below 12px.

**The Money Column Rule.** Every rupiah figure is set with tabular lining numerals so amounts align in columns, and dates are glued with no-break spaces so "Kam, 8 Okt" never splits.

**The Scope Rule.** Every money figure states its scope in words beside it: "Sisa jatah hari ini", "Sisa bulan ini", "Terpakai hari ini", "(dari tagihan)". A bare total is not allowed.

**The Named Figure Rule.** An uppercase, tracked 12px line is permitted only as the heading that names the figure directly below it (SISA JATAH HARI INI) or as a navigation group name. It is never a decorative kicker introducing another heading.

## Layout

Mobile first at 390px, single column, page gutter 16px (24px from 640px), content capped at 72rem (max-w-6xl). The dashboard's jatah note fills about 46svh on phones; below it, the secondary log actions and then today's stubs, newest first. From 1024px the grid is three columns with the note spanning two and stubs in the right column (column gap 40px, row gap 32px). The sidebar (md+) and the mobile bottom bar print in the same paper and hairline language.

Rhythm runs on 4px steps: 8 and 12px inside rows, 16px between stacked stubs and fields, 24 to 32px between sections, 40px between columns. Note interiors pad 20px horizontally on phones and 32px from 640px.

The mobile bottom bar is five equal slots (Beranda, Dompet, Catat seal, Laporan, Menu), 64px tall plus the safe-area inset; the seal sits centered and rises 28px above the bar.

**The Thumb Seal Rule.** On phones (<768px) the Catat seal lives in the center of the bottom bar on every page. On md+ it overlaps the jatah note's lower edge. One seal per screen, never two microphones.

## Elevation & Depth

Flat. Depth is printed, not lit: a 1px ink hairline (15 to 30% alpha), four registration corners, a dotted perforation, a doubled rule. Layering is order and overlap, not shadow. The only box-shadow in the system is the 4px solid paper ring around the Catat seal, which cuts it cleanly out of the bar or note it overlaps, and the 2px ink-at-30% focus ring on fields.

**The Printed Depth Rule.** No drop shadows, gradients, glass, blur or glow. If something must sit above something else, give it a hairline or a paper ring.

## Shapes

Sheets are square-cornered (0px): notes, stubs, fields, option buttons, dialogs, denomination fields. Round is reserved for things you press with a thumb: pill buttons and icon buttons (full radius) and the round Catat seal. Rubber stamps take a barely-softened corner (2px) and always land tilted (-2 to -10 degrees). Recurring geometry: corner registration marks (12px L-shapes), a dashed perforation with half-moon notches where a sheet tears, the dotted leader that joins a receipt label to its amount, and the dashed vertical security thread (6px) near a note's right edge.

## Components

### Buttons
Pressed ink on paper, round because a thumb presses them.
- **Shape:** full pill (9999px), min height 44px.
- **Primary:** ink field, paper-sheet type, body size semibold, 20px side padding. Hover ink at 90%.
- **Secondary:** transparent with a 1px ink-at-30% outline, ink type, 16px side padding. Hover ink at 5%.
- **Icon button:** 44px round, ink glyph, hover ink at 5%.
- **Focus:** 2px solid ink outline, 2px offset (global).
- **Disabled:** 50% opacity.

### Option buttons (choice sets)
- **Style:** square, 1px ink-at-30% outline on paper-sheet, body semibold, min 44px.
- **State:** pressed reads as ink-filled with paper type (aria-pressed). Filters on list pages use the same pressed/unpressed logic in pill form.

### Note (Lembar)
The sheet every surface is printed on.
- **Corner Style:** square, with four 12px registration corners in ink at 50%.
- **Background:** paper-sheet, 1px ink-at-20% border.
- **Shadow Strategy:** none.
- **Security thread:** optional 6px dashed vertical stripe in the status color, 20px (32px from 640px) from the right edge; it recolors over 500ms when status changes.
- **Footer:** optional wavy microtext rule above the serial line.

### Denomination note
A wallet, amplop, slip or goal printed as a flat color field in its denomination with paper type, a paper-toned guilloche rosette at 35% bleeding off the top-right, registration corners in the current color, and a paper-sheet name plate (headline name, meta personality line) printed onto the field without a border.

### Stub
A transaction torn off the note: paper-sheet, 1px ink-at-15% edge, a dotted perforation 6px in from the left, item in body semibold, meta line (wallet, category, time), serial, and the amount right-aligned in body bold. States by form, always repeated as words in the meta line:
- **Dashed edge** (ink at 50%) = belum sinkron.
- **Struck item and amount** = dihapus.
- **Doubled bottom rule** = melewati jatah.
New stubs slide in from 10px above over 450ms.

### Status stamp
Rubber-stamp mark, 12px uppercase tracked, a glyph plus the word, tilted -2 degrees. Reserved vocabulary:
- **Aman:** 1px aman-ink outline, check glyph.
- **Mepet:** 3px doubled mepet-ink outline, warning glyph.
- **Habis:** solid habis field, paper type, cross glyph.
- **Tertunda sinkron:** 1px dashed soft-ink outline, cloud-off glyph.
- **LUNAS:** the paid state, aman tone, may be solid; it thumps down (scale 1.6 to 1 over 300ms) the moment something is paid.
On a denomination field the stamp prints in paper tone.

### State label
Every other state (Tunda 3 hari lagi, Tercatat, Tepat sasaran, Minus) is plain 12px semibold words with an optional 14px glyph, colored by its parent. Never a stamp, never a chip.

### Inputs / Fields
- **Style:** square, paper-sheet, 1px ink-at-30% outline, body size, min 44px, label above in 12px semibold soft ink.
- **Focus:** border goes full ink plus a 2px ink-at-30% ring.
- **Placeholder:** soft ink.

### Paper dialog
Slides up as a bottom sheet on phones, centers at max 32rem on desktop. Paper-sheet, 1px ink-at-20% border, headline title over a hairline, 44px round close button, flat 50% scrim behind. Escape closes.

### Navigation
- **Mobile bottom bar:** paper with a top hairline; tabs are 20px glyph plus 12px label in soft ink; the active tab goes ink, bold, underlined 2px. The Catat seal sits in the center slot. Menu opens a full-screen paper sheet listing all 17 features in groups, each with a body-size name and a 12px one-line description.
- **Sidebar (md+):** paper, grouped list with uppercase 12px group names; the active item is an ink bar with paper type.
- **Page header:** sticky paper masthead with one hairline below; headline title in Bodoni, a back arrow on subpages, breadcrumbs on md+, and a Mode Demo line under the title when demo data is on.

### Catat seal
The primary action. A round ink button (72px minimum, 80px on the note) with a paper-toned guilloche at 40%, a mic glyph and the word CATAT in stamp type, ringed in 4px of paper. Presses to 95%.

### Guilloche rosette
Procedural hypotrochoid line families from a seed, hairline strokes in the current color at falling opacity. One seed per item, so every note carries its own pattern. On the jatah note it turns a few degrees over 700ms each time something is logged.

### Receipt line
Label, dotted leader, amount: the ledger line used for breakdowns inside a description list.

## Do's and Don'ts

### Do:
- **Do** print wallets, envelopes, slips and goals in blue, violet, teal or slate, with paper-colored type.
- **Do** state the scope of every money figure in words next to it (hari ini, bulan ini, dari tagihan, dari profil).
- **Do** use exactly three text sizes (meta 12, body 15, head 22) plus the clamp numeral, with 12px as the floor.
- **Do** show state by form as well as hue, and repeat it in words: doubled = mepet or melewati jatah, dashed record edge = belum sinkron, struck = dihapus, solid fill = habis or LUNAS.
- **Do** keep every touch target at least 44px and the Catat seal at least 72px.
- **Do** put a serial (FNC·DDMMYY·NNNN) on every note and stub.
- **Do** honor reduced motion: the numeral swaps instantly, stubs and stamps appear without movement.

### Don't:
- **Don't** use green, ochre or red for anything but Aman, Mepet and Habis.
- **Don't** use the rubber-stamp form for anything but Aman, Mepet, Habis, Tertunda sinkron and LUNAS; every other state is a plain StateLabel.
- **Don't** strike through anything that is not dihapus.
- **Don't** put a dashed edge on a record unless it is belum sinkron.
- **Don't** use gradients, glass or backdrop blur, glow, or drop shadows.
- **Don't** nest a bordered card inside a card; one sheet per idea, divided by hairlines.
- **Don't** put a small uppercase kicker above a heading.
- **Don't** set any text below 12px or outside the three sizes and the numeral.
- **Don't** show a money figure without its scope.
- **Don't** reproduce real Rupiah artwork (Garuda, Bank Indonesia marks, portraits).

// tests/ui/voice-flow-states.test.ts
import { describe, it, expect } from "vitest";

describe("Voice Flow Component Definitions", () => {
  it("exports VoiceExpenseSheet component", async () => {
    const sheet = await import("@/components/expense/voice-expense-sheet");
    expect(sheet.VoiceExpenseSheet).toBeDefined();
  });

  it("exports VoiceRecorder component", async () => {
    const recorder = await import("@/components/expense/voice-recorder");
    expect(recorder.VoiceRecorder).toBeDefined();
  });

  it("exports TranscriptPreview component", async () => {
    const preview = await import("@/components/expense/transcript-preview");
    expect(preview.TranscriptPreview).toBeDefined();
  });

  it("exports ParsedExpenseList component", async () => {
    const list = await import("@/components/expense/parsed-expense-list");
    expect(list.ParsedExpenseList).toBeDefined();
  });

  it("exports ExpenseEditor component", async () => {
    const editor = await import("@/components/expense/expense-editor");
    expect(editor.ExpenseEditor).toBeDefined();
  });

  it("exports ManualExpenseInput component", async () => {
    const manual = await import("@/components/expense/manual-expense-input");
    expect(manual.ManualExpenseInput).toBeDefined();
  });
});

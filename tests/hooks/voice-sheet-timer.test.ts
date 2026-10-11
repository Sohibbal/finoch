import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", async importOriginal => ({ ...await importOriginal<typeof import("react")>(), ...await import("./react-harness") }));
const mocks = vi.hoisted(() => ({ saveExpenses: vi.fn(), speech: { transcript: "", stopListening: vi.fn(), resetTranscript: vi.fn() } }));
vi.mock("@/hooks/use-hybrid-speech", () => ({ useHybridSpeech: () => mocks.speech }));
vi.mock("@/lib/storage/expense-storage", () => ({ expenseStorage: { saveExpenses: mocks.saveExpenses } }));
vi.mock("@/lib/sync/sync-manager", () => ({ syncManager: { triggerSync: vi.fn() } }));
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
function find(node: any, predicate: (node: any) => boolean): any {
  if (!node) return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = find(child, predicate); if (result) return result;
  }
}
beforeEach(() => { resetHooks(); vi.useFakeTimers(); mocks.saveExpenses.mockResolvedValue(undefined); });
afterEach(() => { unmountHooks(); vi.useRealTimers(); });
it.each(["unmount", "close", "late-save"])("cancels deferred sheet callbacks on %s", async mode => {
  const onClose = vi.fn(); const onExpenseSaved = vi.fn(); let isOpen = true;
  const render = () => renderHook(() => VoiceExpenseSheet({ isOpen, onClose, onExpenseSaved }));
  let tree = render();
  find(tree, node => !!node.props?.onParsed).props.onParsed([{ id: "1", itemName: "Nasi", amount: 12000, category: "Food & Drinks" }]);
  tree = render();
  let finish!: () => void;
  if (mode === "late-save") mocks.saveExpenses.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  const saved = find(tree, node => node.props?.onClick?.name === "handleConfirmAndSave").props.onClick();
  if (mode === "late-save") { unmountHooks(); finish(); }
  await saved;
  if (mode === "unmount") unmountHooks();
  if (mode === "close") { isOpen = false; render(); }
  vi.advanceTimersByTime(1200);
  expect(onClose).not.toHaveBeenCalled(); expect(onExpenseSaved).not.toHaveBeenCalled();
});
it("keeps the normal delayed success callback", async () => {
  const onClose = vi.fn(); const onExpenseSaved = vi.fn();
  const render = () => renderHook(() => VoiceExpenseSheet({ isOpen: true, onClose, onExpenseSaved }));
  find(render(), node => !!node.props?.onParsed).props.onParsed([{ id: "1", itemName: "Nasi", amount: 12000, category: "Food & Drinks" }]);
  await find(render(), node => node.props?.onClick?.name === "handleConfirmAndSave").props.onClick();
  vi.advanceTimersByTime(1200);
  expect(onClose).toHaveBeenCalledOnce(); expect(onExpenseSaved).toHaveBeenCalledOnce();
});

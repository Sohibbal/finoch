import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", async importOriginal => ({ ...await importOriginal<typeof import("react")>(), ...await import("./react-harness") }));
const mocks = vi.hoisted(() => ({
  saveExpenses: vi.fn(),
  deleteExpenses: vi.fn(),
  speech: { transcript: "", stopListening: vi.fn(), resetTranscript: vi.fn() },
}));
vi.mock("@/hooks/use-hybrid-speech", () => ({ useHybridSpeech: () => mocks.speech }));
vi.mock("@/lib/storage/expense-storage", () => ({ expenseStorage: { saveExpenses: mocks.saveExpenses, deleteExpenses: mocks.deleteExpenses } }));
vi.mock("@/lib/sync/sync-manager", () => ({ syncManager: { triggerSync: vi.fn() } }));
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
function find(node: any, predicate: (node: any) => boolean): any {
  if (!node) return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = find(child, predicate); if (result) return result;
  }
}
const item = { id: "1", itemName: "Nasi", amount: 12000, category: "Food & Drinks" };
const saved = [{ id: "exp-1", itemName: "Nasi", amount: 12000, category: "Food & Drinks", createdAt: "2026-10-11T05:00:00.000Z" }];
const receipt = (tree: any) => find(tree, node => !!node.props?.onUndo);
const saveButton = (tree: any) => find(tree, node => node.props?.onClick?.name === "handleConfirmAndSave");
beforeEach(() => { resetHooks(); vi.useFakeTimers(); mocks.saveExpenses.mockResolvedValue(saved); mocks.deleteExpenses.mockResolvedValue(undefined); });
afterEach(() => { unmountHooks(); vi.useRealTimers(); });

it("prints a receipt after saving and stays open until Selesai", async () => {
  const onClose = vi.fn(); const onExpenseSaved = vi.fn();
  const render = () => renderHook(() => VoiceExpenseSheet({ isOpen: true, onClose, onExpenseSaved, sisaHariIni: 23000 }));
  find(render(), node => !!node.props?.onParsed).props.onParsed([item]);
  await saveButton(render()).props.onClick();
  vi.advanceTimersByTime(5000);
  expect(onClose).not.toHaveBeenCalled();
  expect(onExpenseSaved).toHaveBeenCalledOnce();
  const slip = receipt(render());
  expect(slip.props).toMatchObject({ items: [{ name: "Nasi", amount: 12000 }], sisaHariIni: 23000, serialId: "exp-1" });
  slip.props.onDone();
  expect(onClose).toHaveBeenCalledOnce();
});

it("Batalkan deletes exactly the saved expenses and brings the items back for review", async () => {
  const onExpenseSaved = vi.fn();
  const render = () => renderHook(() => VoiceExpenseSheet({ isOpen: true, onClose: vi.fn(), onExpenseSaved }));
  find(render(), node => !!node.props?.onParsed).props.onParsed([item]);
  await saveButton(render()).props.onClick();
  await receipt(render()).props.onUndo();
  expect(mocks.deleteExpenses).toHaveBeenCalledWith(["exp-1"]);
  expect(onExpenseSaved).toHaveBeenCalledTimes(2);
  const tree = render();
  expect(receipt(tree)).toBeUndefined();
  expect(find(tree, node => Array.isArray(node.props?.items) && !!node.props?.onToggleCategory).props.items).toEqual([item]);
});

it("a save that finishes after the sheet closed never prints into the next opening", async () => {
  let isOpen = true;
  const render = () => renderHook(() => VoiceExpenseSheet({ isOpen, onClose: vi.fn() }));
  find(render(), node => !!node.props?.onParsed).props.onParsed([item]);
  let finish!: (v: unknown) => void;
  mocks.saveExpenses.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const saving = saveButton(render()).props.onClick();
  isOpen = false; render();
  finish(saved); await saving;
  isOpen = true;
  expect(receipt(render())).toBeUndefined();
});

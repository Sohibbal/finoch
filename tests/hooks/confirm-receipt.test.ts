import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", async importOriginal => ({ ...await importOriginal<typeof import("react")>(), ...await import("./react-harness") }));
const mocks = vi.hoisted(() => ({ deleteExpenses: vi.fn() }));
vi.mock("@/lib/storage/expense-storage", () => ({ expenseStorage: { deleteExpenses: mocks.deleteExpenses } }));
vi.mock("@/lib/sync/sync-manager", () => ({ syncManager: { triggerSync: vi.fn() } }));
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
function find(node: any, predicate: (node: any) => boolean): any {
  if (!node) return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = find(child, predicate); if (result) return result;
  }
}
const candidate = { merchant: "Indomaret", amount: 18000, category: "Shopping & Lifestyle", date: "2026-10-11", source: "ocr" as const };
const saved = [{ id: "exp-9", itemName: "Indomaret", amount: 18000, category: "Shopping & Lifestyle", createdAt: "2026-10-11T05:00:00.000Z" }];
const receipt = (tree: any) => find(tree, node => !!node.props?.onUndo);
const submit = { preventDefault: () => {} };
beforeEach(() => { resetHooks(); mocks.deleteExpenses.mockResolvedValue(undefined); });
afterEach(() => unmountHooks());

it("prints the save receipt for a scanned struk, and Batalkan deletes exactly that save", async () => {
  const onConfirm = vi.fn().mockResolvedValue(saved); const onUndone = vi.fn(); const onClose = vi.fn();
  const render = () => renderHook(() => UnifiedConfirmationModal({ isOpen: true, candidate, onClose, onConfirm, onUndone, sisaHariIni: 5000 }));
  render();
  await find(render(), node => node.type === "form").props.onSubmit(submit);
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ amount: 18000, merchant: "Indomaret" }), undefined);
  expect(receipt(render()).props).toMatchObject({ items: [{ name: "Indomaret", amount: 18000 }], sisaHariIni: 5000 });

  await receipt(render()).props.onUndo();
  expect(mocks.deleteExpenses).toHaveBeenCalledWith(["exp-9"]);
  expect(onUndone).toHaveBeenCalledOnce();
  expect(receipt(render())).toBeUndefined();
  expect(onClose).not.toHaveBeenCalled();
});

it("keeps the caller-closes contract when onConfirm returns nothing", async () => {
  const onConfirm = vi.fn();
  const render = () => renderHook(() => UnifiedConfirmationModal({ isOpen: true, candidate, onClose: vi.fn(), onConfirm }));
  render();
  await find(render(), node => node.type === "form").props.onSubmit(submit);
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(receipt(render())).toBeUndefined();
});

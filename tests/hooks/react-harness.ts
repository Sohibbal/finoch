// Small hook runner for node-only lifecycle tests; no DOM or new dependencies required.
let slots: any[] = [];
let cursor = 0;
let effects: (() => void)[] = [];
export function resetHooks() { unmountHooks(); slots = []; cursor = 0; effects = []; }
export function unmountHooks() { for (const slot of slots) { slot?.cleanup?.(); if (slot) slot.cleanup = undefined; } }
export function renderHook<T>(hook: () => T): T {
  cursor = 0;
  const value = hook();
  const pending = effects;
  effects = [];
  pending.forEach(effect => effect());
  return value;
}
export function useState(initial: any) {
  const index = cursor++;
  if (!(index in slots)) slots[index] = { value: typeof initial === "function" ? initial() : initial };
  return [slots[index].value, (value: any) => { slots[index].value = typeof value === "function" ? value(slots[index].value) : value; }];
}
export function useRef(value: any) {
  const index = cursor++;
  if (!(index in slots)) slots[index] = { current: value };
  return slots[index];
}
export function useEffect(callback: () => any, deps?: unknown[]) {
  const index = cursor++;
  const previous = slots[index];
  if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
    slots[index] = { deps, cleanup: previous?.cleanup };
    effects.push(() => { previous?.cleanup?.(); slots[index].cleanup = callback(); });
  }
}
export function useMemo(callback: () => any, deps: unknown[]) {
  const index = cursor++;
  if (!slots[index] || deps.some((value, i) => !Object.is(value, slots[index].deps[i]))) slots[index] = { deps, value: callback() };
  return slots[index].value;
}
export function useCallback(callback: any, deps: unknown[]) { return useMemo(() => callback, deps); }

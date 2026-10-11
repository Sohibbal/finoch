import { NAVIGATION_ITEMS, type NavigationItem } from "./navigation-items";

export { NAVIGATION_ITEMS, type NavigationItem };

export type NavItem = NavigationItem;

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** 6 Core Menus of Finoch */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: "Fitur Utama",
    items: NAVIGATION_ITEMS,
  },
];

export function matchesNav(item: NavItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.label.toLowerCase().includes(q) ||
    item.desc.toLowerCase().includes(q) ||
    item.href.includes(q) ||
    item.keywords.some((k) => k.includes(q))
  );
}

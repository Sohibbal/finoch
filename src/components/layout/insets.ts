/**
 * Mobile bottom insets, stacked so nothing covers anything else:
 * nav bar (bottom-3, h-16) < floating pills (Menu Fitur, Pasang Finoch) < page action bars.
 * The app shell pads its content by enough to clear all three.
 */
export const FLOATING_PILL_BOTTOM = "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]";
export const ACTION_BAR_BOTTOM = "bottom-[calc(8.25rem+env(safe-area-inset-bottom))]";

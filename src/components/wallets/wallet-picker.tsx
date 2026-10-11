"use client";

import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { getWallets } from "@/lib/storage/wallet-storage";
import { getDefaultWalletId } from "@/lib/financial/wallet-engine";

interface WalletPickerProps {
  /** undefined = the default wallet (expenseStorage resolves the same one when saving). */
  value?: string;
  onChange: (walletId: string) => void;
}

/** "Bayar dari" wallet select for expense confirm flows; hidden when the user has no wallets. */
export function WalletPicker({ value, onChange }: WalletPickerProps) {
  // Only mounted inside open (client-side) sheets, so localStorage is available.
  const [wallets] = useState(getWallets);
  if (wallets.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
        Bayar dari Dompet
      </label>
      <div className="relative">
        <select
          value={value ?? getDefaultWalletId(wallets) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-sm font-medium text-navy-950 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 appearance-none shadow-sm transition"
        >
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <Wallet className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute right-3 top-3 pointer-events-none" />
      </div>
    </div>
  );
}

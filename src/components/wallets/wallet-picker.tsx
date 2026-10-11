"use client";

import React, { useState } from "react";
import { getWallets } from "@/lib/storage/wallet-storage";
import { getDefaultWalletId } from "@/lib/financial/wallet-engine";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/press/kampus-press";

interface WalletPickerProps {
  /** undefined = the default wallet (expenseStorage resolves the same one when saving). */
  value?: string;
  onChange: (walletId: string) => void;
  label?: string;
}

/** "Bayar dari" wallet select for expense confirm flows; hidden when the user has no wallets. */
export function WalletPicker({ value, onChange, label = "Bayar dari dompet" }: WalletPickerProps) {
  // Only mounted inside open (client-side) sheets, so localStorage is available.
  const [wallets] = useState(getWallets);
  if (wallets.length === 0) return null;

  return (
    <div>
      <label htmlFor="wallet-picker" className={LABEL_CLASS}>
        {label}
      </label>
      <select
        id="wallet-picker"
        value={value ?? getDefaultWalletId(wallets) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        // 16px: smaller makes iOS zoom into the field.
        className={FIELD_CLASS.replace("text-body", "text-base")}
      >
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}

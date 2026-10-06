"use client";

import React, { useState } from "react";
import {
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  ArrowRightLeft,
  Edit3,
  AlertTriangle,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { StudentWallet, WalletType } from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WalletCardMobileProps {
  wallet: StudentWallet;
  onTransfer: (wallet: StudentWallet) => void;
  onEdit: (wallet: StudentWallet) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICONS: Record<WalletType, React.ElementType> = {
  cash: Wallet,
  bank: Landmark,
  ewallet: Smartphone,
};

const COLOR_GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-600 to-teal-700 text-white",
  blue: "from-blue-600 to-indigo-700 text-white",
  purple: "from-purple-600 to-pink-700 text-white",
  amber: "from-amber-600 to-orange-700 text-white",
  cyan: "from-cyan-600 to-blue-700 text-white",
};

export function WalletCardMobile({
  wallet,
  onTransfer,
  onEdit,
  onDelete,
}: WalletCardMobileProps) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = TYPE_ICONS[wallet.type] || Wallet;
  const gradient = COLOR_GRADIENTS[wallet.color] || COLOR_GRADIENTS.emerald;
  const isCritical = wallet.balance < 20000;

  return (
    <div
      className={`relative rounded-3xl p-5 shadow-md bg-gradient-to-br ${gradient} flex flex-col justify-between overflow-hidden transition-all`}
    >
      {/* Background Decorative Rings */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white leading-tight">
              {wallet.name}
            </h3>
            <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
              {wallet.type === "cash"
                ? "Uang Tunai"
                : wallet.type === "bank"
                ? "Rekening Bank"
                : "Dompet Digital"}
            </span>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Menu Dompet"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-9 z-30 w-36 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-cream-200 dark:border-navy-800 py-1 text-xs text-navy-900 dark:text-cream-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(wallet);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-cream-100 dark:hover:bg-navy-800"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Saldo</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm(`Hapus dompet "${wallet.name}"?`)) onDelete(wallet.id);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Balance Display */}
      <div className="my-5 relative z-10">
        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider block">
          Saldo Tersedia:
        </span>
        <div className="text-2xl font-black text-white tracking-tight">
          {formatRupiah(wallet.balance)}
        </div>
        {wallet.accountNumber && (
          <span className="text-[11px] text-white/70 font-mono mt-0.5 block">
            {wallet.accountNumber}
          </span>
        )}
      </div>

      {/* Critical Warning or Notes */}
      {isCritical ? (
        <div className="mb-3 py-1.5 px-2.5 rounded-xl bg-black/25 backdrop-blur-md flex items-center gap-1.5 text-[10px] font-bold text-amber-200 relative z-10">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>Saldo menipis (&lt; Rp 20.000)</span>
        </div>
      ) : wallet.notes ? (
        <p className="text-[10px] text-white/75 line-clamp-1 mb-3 relative z-10">
          {wallet.notes}
        </p>
      ) : null}

      {/* Quick Action Button */}
      <div className="pt-2 border-t border-white/15 relative z-10 flex gap-2">
        <button
          onClick={() => onTransfer(wallet)}
          className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all backdrop-blur-md"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Pindah Saldo</span>
        </button>

        <button
          onClick={() => onEdit(wallet)}
          className="min-h-[44px] px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center justify-center active:scale-95 transition-all backdrop-blur-md"
          title="Ubah Saldo"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

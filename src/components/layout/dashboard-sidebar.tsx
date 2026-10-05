"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Target,
  Bot,
  User,
  LogOut,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./theme-toggle";

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className = "" }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/split-bill",
      label: "Split Bill Resto",
      icon: Receipt,
    },
    {
      href: "/simulator",
      label: "Simulator Arus Kas",
      icon: Compass,
    },
    {
      href: "/goals",
      label: "Target Tabungan",
      icon: Target,
    },
    {
      href: "/copilot",
      label: "AI Copilot",
      icon: Bot,
    },
    {
      href: "/profile",
      label: "Profil Saya",
      icon: User,
    },
  ];

  return (
    <aside
      className={`w-64 h-screen sticky top-0 self-start overflow-y-auto bg-cream-50 dark:bg-navy-950 border-r border-cream-300 dark:border-navy-800 flex flex-col justify-between p-4 shrink-0 transition-colors ${className}`}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 group">
          <span className="text-lg font-black tracking-tight text-navy-950 dark:text-cream-50">
            finoch<span className="text-emerald-500">.id</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 font-bold shadow-sm"
                    : "text-navy-700/80 dark:text-cream-300/80 hover:text-navy-950 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-navy-900/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-current" : "text-navy-500 dark:text-cream-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Theme Toggle & User Info */}
      <div className="pt-4 border-t border-cream-200 dark:border-navy-800 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-navy-600 dark:text-cream-400 font-medium">Tema Tampilan</span>
          <ThemeToggle />
        </div>

        {user && (
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-cream-200 dark:bg-navy-900 text-navy-950 dark:text-cream-100 font-bold text-xs flex items-center justify-center shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-navy-950 dark:text-cream-50 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-navy-500 dark:text-cream-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Keluar Akun"
              aria-label="Keluar Akun"
              className="p-1.5 rounded-lg text-navy-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

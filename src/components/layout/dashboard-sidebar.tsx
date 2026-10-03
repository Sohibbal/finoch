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
  Sparkles,
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
      href: "/simulator",
      label: "What-If Simulator",
      icon: Compass,
    },
    {
      href: "/goals",
      label: "Goals",
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
      className={`w-64 bg-white dark:bg-[#0c1322] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between p-4 shrink-0 transition-colors ${className}`}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1 group">
          <div className="w-8 h-8 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-300 dark:text-white" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              FINRA
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">
              Smart Financial Assistant
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Theme Toggle & User Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-500 font-medium">Tema Tampilan</span>
          <ThemeToggle />
        </div>

        {user && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Keluar Akun"
              aria-label="Keluar Akun"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

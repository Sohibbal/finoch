"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ChevronRight,
  GraduationCap,
  Wallet,
  Compass,
  Bot,
  User,
  Utensils,
  Receipt,
  Handshake,
  Hourglass,
  Flame,
  CreditCard,
  CalendarClock,
  Zap,
  FileSpreadsheet,
  Target,
} from "lucide-react";

export interface BreadcrumbCustomItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbRouteConfig {
  label: string;
  parentLabel?: string;
  parentHref?: string;
  parentIcon?: React.ComponentType<{ className?: string }>;
  icon?: React.ComponentType<{ className?: string }>;
}

export const ROUTE_BREADCRUMB_MAP: Record<string, BreadcrumbRouteConfig> = {
  "/dashboard": {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  "/copilot": {
    label: "AI Copilot Finansial",
    parentLabel: "Asisten Cerdas",
    parentHref: "/dashboard",
    parentIcon: Bot,
    icon: Bot,
  },
  "/simulator": {
    label: "Simulator Arus Kas",
    parentLabel: "Analisis & Rencana",
    parentHref: "/dashboard",
    parentIcon: Compass,
    icon: Compass,
  },
  "/goals": {
    label: "Target Finansial",
    parentLabel: "Analisis & Rencana",
    parentHref: "/dashboard",
    parentIcon: Compass,
    icon: Target,
  },
  "/reports": {
    label: "Laporan & LPJ Beasiswa",
    parentLabel: "Analisis & Rencana",
    parentHref: "/dashboard",
    parentIcon: Compass,
    icon: FileSpreadsheet,
  },
  "/wallets": {
    label: "Multi-Dompet Akun",
    parentLabel: "Kas & Anggaran",
    parentHref: "/dashboard",
    parentIcon: Wallet,
    icon: CreditCard,
  },
  "/budget": {
    label: "Amplop Anggaran",
    parentLabel: "Kas & Anggaran",
    parentHref: "/dashboard",
    parentIcon: Wallet,
    icon: Wallet,
  },
  "/bills": {
    label: "Tagihan Kost & Rutin",
    parentLabel: "Kas & Anggaran",
    parentHref: "/dashboard",
    parentIcon: Wallet,
    icon: CalendarClock,
  },
  "/audit": {
    label: "Audit Bocor Halus",
    parentLabel: "Kas & Anggaran",
    parentHref: "/dashboard",
    parentIcon: Wallet,
    icon: Zap,
  },
  "/ukt-savings": {
    label: "Sinking Fund UKT & Kampus",
    parentLabel: "Mahasiswa & Kost",
    parentHref: "/dashboard",
    parentIcon: GraduationCap,
    icon: GraduationCap,
  },
  "/meal-calc": {
    label: "Masak vs Warteg",
    parentLabel: "Mahasiswa & Kost",
    parentHref: "/dashboard",
    parentIcon: GraduationCap,
    icon: Utensils,
  },
  "/split-bill": {
    label: "Split Bill & Talangan",
    parentLabel: "Mahasiswa & Kost",
    parentHref: "/dashboard",
    parentIcon: GraduationCap,
    icon: Receipt,
  },
  "/debts": {
    label: "Buku Kasbon & Hutang",
    parentLabel: "Mahasiswa & Kost",
    parentHref: "/dashboard",
    parentIcon: GraduationCap,
    icon: Handshake,
  },
  "/wishlist": {
    label: "Wishlist Anti-Impulsif",
    parentLabel: "Mahasiswa & Kost",
    parentHref: "/dashboard",
    parentIcon: GraduationCap,
    icon: Hourglass,
  },
  "/streak": {
    label: "Streak Hemat",
    parentLabel: "Mahasiswa & Kost",
    parentHref: "/dashboard",
    parentIcon: GraduationCap,
    icon: Flame,
  },
  "/profile": {
    label: "Profil Pengguna",
    parentLabel: "Pengaturan",
    parentHref: "/dashboard",
    parentIcon: User,
    icon: User,
  },
};

export interface BreadcrumbsProps {
  items?: BreadcrumbCustomItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export function Breadcrumbs({
  items,
  className = "",
  showHomeIcon = true,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // If custom items are provided, render them
  if (items && items.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className={`flex items-center min-w-0 ${className}`}>
        <ol className="flex items-center gap-1.5 text-xs text-navy-600 dark:text-cream-400 font-medium overflow-hidden">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 shrink-0">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-navy-400 dark:text-cream-600 shrink-0" />
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5 truncate max-w-[200px]"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    <span>{item.label}</span>
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Auto-resolve breadcrumb from route map
  const route = ROUTE_BREADCRUMB_MAP[pathname];
  const isDashboard = pathname === "/dashboard";

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center min-w-0 ${className}`}>
      <ol className="flex items-center gap-1.5 text-xs text-navy-600 dark:text-cream-400 font-medium overflow-hidden">
        {/* Step 1: Root Home/Dashboard */}
        <li className="flex items-center shrink-0">
          {isDashboard ? (
            <span
              aria-current="page"
              className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5"
            >
              {showHomeIcon && <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              <span>Dashboard</span>
            </span>
          ) : (
            <Link
              href="/dashboard"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              {showHomeIcon && <LayoutDashboard className="w-3.5 h-3.5" />}
              <span>Dashboard</span>
            </Link>
          )}
        </li>

        {/* Step 2: Parent Category (if present) */}
        {!isDashboard && route?.parentLabel && (
          <li className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-navy-400 dark:text-cream-600 shrink-0" />
            {route.parentHref ? (
              <Link
                href={route.parentHref}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 truncate max-w-[150px]"
              >
                {route.parentIcon && <route.parentIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                <span>{route.parentLabel}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-navy-500 dark:text-cream-400 truncate max-w-[150px]">
                {route.parentIcon && <route.parentIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                <span>{route.parentLabel}</span>
              </span>
            )}
          </li>
        )}

        {/* Step 3: Current Page */}
        {!isDashboard && route && (
          <li className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-navy-400 dark:text-cream-600 shrink-0" />
            <span
              aria-current="page"
              className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5 truncate max-w-[220px]"
            >
              {route.icon && (
                <route.icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <span>{route.label}</span>
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

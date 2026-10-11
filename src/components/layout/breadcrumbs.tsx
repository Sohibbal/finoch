"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-items";
import { LayoutDashboard, ChevronRight } from "lucide-react";

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

// Names come from the shared navigation, so the breadcrumb, sidebar and menu never disagree.
export const ROUTE_BREADCRUMB_MAP: Record<string, BreadcrumbRouteConfig> = Object.fromEntries(
  NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => [
      item.href,
      group.label === "Utama" && item.href === "/dashboard"
        ? { label: item.label, icon: item.icon }
        : { label: item.label, icon: item.icon, parentLabel: group.label, parentHref: "/dashboard" },
    ])
  )
);

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
        <ol className="flex items-center gap-1.5 text-meta text-ink-soft font-medium overflow-hidden">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 shrink-0">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-bold text-ink flex items-center gap-1.5 truncate max-w-[200px]"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-ink hover:underline underline-offset-2 transition-colors flex items-center gap-1.5"
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
      <ol className="flex items-center gap-1.5 text-meta text-ink-soft font-medium overflow-hidden">
        {/* Step 1: Root Home/Dashboard */}
        <li className="flex items-center shrink-0">
          {isDashboard ? (
            <span
              aria-current="page"
              className="font-bold text-ink flex items-center gap-1.5"
            >
              {showHomeIcon && <LayoutDashboard className="w-3.5 h-3.5" />}
              <span>Beranda</span>
            </span>
          ) : (
            <Link
              href="/dashboard"
              className="hover:text-ink hover:underline underline-offset-2 transition-colors flex items-center gap-1.5"
            >
              {showHomeIcon && <LayoutDashboard className="w-3.5 h-3.5" />}
              <span>Beranda</span>
            </Link>
          )}
        </li>

        {/* Step 2: Parent Category (if present) */}
        {!isDashboard && route?.parentLabel && (
          <li className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-ink-soft shrink-0" />
            {route.parentHref ? (
              <Link
                href={route.parentHref}
                className="hover:text-ink hover:underline underline-offset-2 transition-colors flex items-center gap-1 truncate max-w-[150px]"
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
            <ChevronRight className="w-3.5 h-3.5 text-ink-soft shrink-0" />
            <span
              aria-current="page"
              className="font-bold text-ink flex items-center gap-1.5 truncate max-w-[220px]"
            >
              {route.icon && (
                <route.icon className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{route.label}</span>
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

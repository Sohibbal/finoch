"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { NAV_GROUPS } from "./nav-items";

interface GlobalSearchBarProps {
  className?: string;
}

export function GlobalSearchBar({ className = "" }: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten searchable nav items
  const allNavItems = NAV_GROUPS.flatMap((g) => g.items);
  const filtered = query.trim()
    ? allNavItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.desc?.toLowerCase().includes(query.toLowerCase()) ||
          item.href.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search
          className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Cari menu..."
          aria-label="Cari menu"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) {
              router.push(filtered[0].href);
              setIsOpen(false);
            }
          }}
          className="h-8 w-36 sm:w-52 pl-8 pr-7 text-xs rounded-xl bg-white/80 dark:bg-slate-800/80 border border-blue-200/70 dark:border-slate-700/80 placeholder:text-slate-400 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:w-48 sm:focus:w-64 transition-all shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-1 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Hapus pencarian"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Quick Search Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-[#0F1B2C] border border-slate-200/90 dark:border-slate-700 shadow-xl z-50 p-2 space-y-1">
          <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigasi Cepat
          </p>
          {filtered.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-slate-400 text-center">
              Menu &quot;{query}&quot; tidak ditemukan
            </p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{item.label}</p>
                    {item.desc && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

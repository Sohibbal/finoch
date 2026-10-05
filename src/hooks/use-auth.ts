"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types/auth";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        syncManager.setAuthenticated(Boolean(data.user));
      } else {
        setUser(null);
        syncManager.setAuthenticated(false);
      }
    } catch {
      setUser(null);
      syncManager.setAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk.");
        return false;
      }

      setUser(data.user);
      syncManager.setAuthenticated(true);

      // Migrate any guest expenses to this authenticated user
      await expenseStorage.claimGuestExpenses(data.user.id);
      syncManager.triggerSync(true);

      return true;
    } catch {
      setError("Terjadi masalah jaringan. Silakan coba lagi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mendaftar.");
        return false;
      }

      setUser(data.user);
      syncManager.setAuthenticated(true);

      // Migrate guest expenses
      await expenseStorage.claimGuestExpenses(data.user.id);
      syncManager.triggerSync(true);

      return true;
    } catch {
      setError("Terjadi masalah jaringan. Silakan coba lagi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    syncManager.setAuthenticated(false);
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkSession,
  };
}

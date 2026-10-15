"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types/auth";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import { getStorageScope, setStorageScope } from "@/lib/storage/local-storage";
import { clearFinBotChatHistory } from "@/lib/storage/finbot-chat-storage";

// Guest data moves into the account before sync starts, so the first sync already uploads it.
async function startUserSession(userId: string) {
  await expenseStorage.claimGuestExpenses(userId);
  setStorageScope(userId);
  syncManager.setAuthenticated(true);
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // True when the server couldn't answer (offline / 5xx): the session is unknown, not absent.
  const [sessionUnavailable, setSessionUnavailable] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      setSessionUnavailable(res.status >= 500);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // No session means guest: never keep showing a previous user's data on a shared device.
        setStorageScope(data.user?.id);
        syncManager.setAuthenticated(Boolean(data.user));
      } else {
        setUser(null);
        syncManager.setAuthenticated(false);
      }
    } catch {
      // Offline: keep the current scope so a logged-in user still sees their local-first data.
      setSessionUnavailable(true);
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

      await startUserSession(data.user.id);
      setUser(data.user);

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

      await startUserSession(data.user.id);
      setUser(data.user);

      return true;
    } catch {
      setError("Terjadi masalah jaringan. Silakan coba lagi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Flush once while the session cookie is still valid, then drop whatever is left: the queue
  // must never upload this user's changes under the next account. Their local expenses stay in
  // IndexedDB, scoped by userId, so other users can't see them.
  const logout = async () => {
    const userId = getStorageScope();
    await syncManager.triggerSync(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    syncManager.setAuthenticated(false);
    try {
      await syncManager.clearUserSyncState(userId);
    } catch {
      // IndexedDB unavailable: nothing queued to clear
    }
    clearFinBotChatHistory(userId);
    setStorageScope(null);
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    sessionUnavailable,
    error,
    login,
    register,
    logout,
    checkSession,
  };
}

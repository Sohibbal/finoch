"use client";

import { useState, useEffect, useCallback } from "react";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import type { Expense } from "@/lib/types/expense";

export function useExpenses(userId = "guest") {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshExpenses = useCallback(async () => {
    try {
      const items = await expenseStorage.getExpenses(userId);
      setExpenses(items);
    } catch {
      // Ignore storage errors on init
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshExpenses();

    // Listen to sync completions to update UI
    const unsubscribe = syncManager.subscribe((status) => {
      if (status === "synced") {
        refreshExpenses();
      }
    });

    return () => unsubscribe();
  }, [refreshExpenses]);

  const deleteExpense = async (id: string) => {
    await expenseStorage.deleteExpense(id);
    syncManager.triggerSync();
    await refreshExpenses();
  };

  return {
    expenses,
    isLoading,
    refreshExpenses,
    deleteExpense,
  };
}

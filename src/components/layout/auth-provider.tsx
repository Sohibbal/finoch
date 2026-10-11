"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";

type AuthValue = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthValue | null>(null);

/** One useAuth() instance for the whole app shell, so /api/auth/me runs once per load. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={useAuth()}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return value;
}

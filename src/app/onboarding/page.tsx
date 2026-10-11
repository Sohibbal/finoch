"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { TypewriterCard } from "@/components/onboarding/typewriter-card";
import { invalidateFinancialProfile } from "@/hooks/use-financial-profile";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleComplete = async (nickname: string) => {
    setIsLoading(true);
    setServerError(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("finoch_user_nickname", nickname);
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok && res.status !== 404) {
        // If profile endpoint returns error, still proceed if local storage saved
        console.warn("Server profile update status:", res.status);
      }

      invalidateFinancialProfile();
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      // Fallback: still navigate to dashboard since local nickname is stored
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper dark:bg-navy-950 px-4 py-8 sm:py-12">
      {/* Top Brand Logo */}
      <header className="flex justify-center">
        <BrandLogo />
      </header>

      {/* Main Typewriter Onboarding Card */}
      <main className="w-full flex justify-center my-auto">
        <TypewriterCard onComplete={handleComplete} isLoading={isLoading} />
      </main>

      {/* Footer */}
      <footer className="text-center text-meta text-ink-soft dark:text-navy-400">
        <p>Finoch · Teman Finansial Cerdas Mahasiswa</p>
      </footer>
    </div>
  );
}

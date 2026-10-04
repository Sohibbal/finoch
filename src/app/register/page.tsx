import React, { Suspense } from "react";
import { AuthSlider } from "@/components/auth/auth-slider";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 dark:bg-navy-950" />}>
      <AuthSlider initialMode="register" />
    </Suspense>
  );
}

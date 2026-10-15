import React, { Suspense } from "react";
import { AuthSlider } from "@/components/auth/auth-slider";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eaf0fd] dark:bg-[#050813]" />}>
      <AuthSlider initialMode="login" />
    </Suspense>
  );
}

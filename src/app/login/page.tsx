import React, { Suspense } from "react";
import { AuthSlider } from "@/components/auth/auth-slider";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <AuthSlider initialMode="login" />
    </Suspense>
  );
}

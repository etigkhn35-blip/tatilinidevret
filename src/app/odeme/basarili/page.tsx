"use client";

import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Yükleniyor...</main>}>
      <SuccessContent />
    </Suspense>
  );
}

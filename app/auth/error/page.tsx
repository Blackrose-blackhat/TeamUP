// app/auth/error/page.tsx
import React, { Suspense } from "react";
import { ErrorPageClient } from "@/components/auth/error-client";

export default function ErrorPageWrapper() {
  return (
      <Suspense fallback={<div>Loading...</div>}>

        <ErrorPageClient />;
      </Suspense>

  )
}

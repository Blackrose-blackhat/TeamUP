// app/auth/signin/page.tsx
import { Suspense } from "react";
import SignInPageClient from "@/components/auth/sigin-clinet";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPageClient />
    </Suspense>
  );
}

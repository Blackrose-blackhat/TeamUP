"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButtons() {
  const { data: session } = useSession();
  console.log(session);

  if (session) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p>Welcome, {session.user?.name}</p>
        <Button onClick={() => signOut()}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
 <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
  Login with Google
</Button>
<Button onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
  Login with GitHub
</Button>

    </div>
  );
}

"use client";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already linked with another provider. Please log in with the original provider you used.",
  AccessDenied: "You don’t have access to this resource.",
  Configuration: "There was a configuration issue with authentication.",
  DeletedUser:
    "Your account was previously deleted. Please create a new account to continue.",
};

export function ErrorPageClient() {
  const params = useSearchParams();
  const error = params.get("error") ?? "default";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h1>
      <p>{errorMessages[error] || "Something went wrong. Please try again."}</p>

      <a
        href="/auth/signin"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Back to Sign In
      </a>
    </div>
  );
}

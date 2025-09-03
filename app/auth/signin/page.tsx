"use client"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const params = useSearchParams()
  const error = params.get("error")

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      {error && (
        <p className="text-red-500 mb-4">
          {error === "OAuthAccountNotLinked"
            ? "This email is already linked with another provider. Please use the provider you signed up with."
            : "Something went wrong. Please try again."}
        </p>
      )}
      <a
        href="/api/auth/signin/google"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Sign in with Google
      </a>
      <a
        href="/api/auth/signin/github"
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
      >
        Sign in with GitHub
      </a>
    </div>
  )
}

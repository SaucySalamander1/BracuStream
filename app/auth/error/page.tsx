"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  DomainRestricted: {
    title: "Access denied",
    body: "Only @g.bracu.ac.bd Google accounts can sign in to BRACUStream. Please use your BRACU student email.",
  },
  OAuthAccountNotLinked: {
    title: "Account conflict",
    body: "This email is already linked to a different sign-in method. Please use the same method you used before.",
  },
  Default: {
    title: "Something went wrong",
    body: "An unexpected error occurred during sign in. Please try again.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const errorCode    = searchParams.get("error") ?? "Default";
  const { title, body } =
    ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold text-white mb-3">{title}</h1>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">{body}</p>
        <button
          onClick={() => router.push("/auth/signin")}
          className="bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <ErrorContent />
    </Suspense>
  );
}
"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || "/dashboard";
  const error        = searchParams.get("error");

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest font-mono">
            <span style={{ color: "#d4a017" }}>BRACU</span>
            <span className="text-white">STREAM</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Learn at your own pace
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-1">
            Sign in to continue
          </h2>
          <p className="text-neutral-400 text-sm mb-8">
            Use your BRACU Google account{" "}
            <span className="text-neutral-300 font-mono text-xs">
              @g.bracu.ac.bd
            </span>
          </p>

          {error && (
            <div className="mb-6 bg-red-950 border border-red-800 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">
                {error === "AccessDenied"
                  ? "Only @g.bracu.ac.bd accounts are allowed."
                  : "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-3 px-4 rounded-xl transition-colors duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-neutral-600 text-xs text-center mt-6 leading-relaxed">
            Only BRACU student and faculty accounts can sign in.
            <br />
            Contact your admin if you have trouble accessing.
          </p>
        </div>

        <p className="text-neutral-700 text-xs text-center mt-6">
          © {new Date().getFullYear()} BRACUStream. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <SignInContent />
    </Suspense>
  );
}
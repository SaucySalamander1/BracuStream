"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 hover:bg-neutral-800 rounded-lg px-2 py-1.5 transition-colors"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User"}
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white leading-none">
            {user.name?.split(" ")[0]}
          </p>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            {user.role}
          </p>
        </div>
        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 font-mono truncate mt-0.5">{user.email}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
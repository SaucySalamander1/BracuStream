"use client";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

const NAV = [
  { label: "Dashboard",  href: "/admin",              icon: "🏠" },
  { label: "Courses",    href: "/admin/courses",       icon: "📚" },
  { label: "Students",   href: "/admin/students",      icon: "👥" },
  { label: "Analytics",  href: "/admin/analytics",     icon: "📊" },
];

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <aside className="w-56 flex-none bg-neutral-900 border-r border-neutral-800 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div
        className="px-5 py-4 border-b border-neutral-800 cursor-pointer"
        onClick={() => router.push("/admin")}
      >
        <div className="font-mono font-bold text-base tracking-widest">
          <span style={{ color: "#d4a017" }}>BRACU</span>
          <span className="text-white">STREAM</span>
        </div>
        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono mt-1 inline-block">
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
              style={{
                background: isActive ? "#d4a01722" : "transparent",
                color:      isActive ? "#d4a017"   : "#888",
                borderLeft: isActive ? "2px solid #d4a017" : "2px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* View site link */}
      <div className="px-3 pb-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-600 hover:text-neutral-400 transition-colors text-left"
        >
          <span>🌐</span>
          <span>View Site</span>
        </button>
      </div>

      {/* User */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="w-full text-xs text-red-400 hover:text-red-300 py-1.5 rounded-lg hover:bg-red-950/30 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserMenu from "@/components/auth/UserMenu";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-lg tracking-widest">
            <span style={{ color: "#d4a017" }}>BRACU</span>
            <span className="text-white">STREAM</span>
          </span>
          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
            ADMIN
          </span>
        </div>
        <UserMenu user={session.user} />
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-6">🛠️</div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Admin Panel
        </h1>
        <p className="text-neutral-400 text-sm mb-2">
          Signed in as <span className="text-neutral-300 font-mono">{session.user.email}</span>
        </p>
        <p className="text-neutral-500 text-sm">
          Module 01 complete ✅ — Admin course management coming in Module 07.
        </p>
      </main>
    </div>
  );
}
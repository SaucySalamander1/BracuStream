import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import StudentAnalytics from "@/components/analytics/StudentAnalytics";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role === "admin") redirect("/admin/analytics");

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar user={session.user} />
      <StudentAnalytics userId={session.user.id} userName={session.user.name ?? ""} />
    </div>
  );
}
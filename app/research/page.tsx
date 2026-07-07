import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResearchHub from "@/components/research/ResearchHub";

export default async function ResearchPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <ResearchHub
      user={{
        id:    session.user.id,
        name:  session.user.name ?? "",
        email: session.user.email ?? "",
        role:  session.user.role,
      }}
    />
  );
}
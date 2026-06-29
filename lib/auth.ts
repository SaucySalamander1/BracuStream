import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { adminDb } from "@/lib/firebase-admin";
import { UserRole } from "@/types";

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || "g.bracu.ac.bd";
const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error:  "/auth/error",
  },

  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? "";
      if (ADMIN_EMAILS.includes(email)) return true;
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) return false;
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        const email = user.email ?? "";
        const uid   = token.sub ?? "";

        let role: UserRole = "student";
        if (ADMIN_EMAILS.includes(email)) role = "admin";

        try {
          const userRef = adminDb.collection("users").doc(uid);
          const snap    = await userRef.get();

          if (!snap.exists) {
            await userRef.set({
              uid,
              email,
              name:      user.name ?? "",
              image:     user.image ?? "",
              role,
              createdAt: new Date(),
              lastSeen:  new Date(),
              progress:  {},
              ratings:   {},
            });
          } else {
            const existing = snap.data();
            role = existing?.role ?? role;
            await userRef.update({ lastSeen: new Date() });
          }
        } catch (e) {
          console.error("Firestore error:", e);
        }

        token.uid  = uid;
        token.role = role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id    = token.uid as string;
        session.user.role  = token.role as UserRole;
      }
      return session;
    },
  },
});
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,

      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid email profile",
        },
      },

      token: "https://oauth2.googleapis.com/token",

      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    }),
  ],

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return false;

      try {
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          // Check if profile exists by email first to avoid unique constraint collisions
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("id, auth_user_id")
            .eq("email", user.email)
            .maybeSingle();

          const authUserId =
            existingProfile?.auth_user_id ||
            user.id ||
            account?.providerAccountId ||
            user.email;

          if (existingProfile) {
            await supabaseAdmin
              .from("profiles")
              .update({
                name: user.name || null,
                avatar_url: user.image || null,
                updated_at: new Date().toISOString(),
              })
              .eq("email", user.email);
          } else {
            const { error: insertErr } = await supabaseAdmin
              .from("profiles")
              .insert({
                auth_user_id: String(authUserId),
                email: user.email,
                name: user.name || null,
                avatar_url: user.image || null,
                updated_at: new Date().toISOString(),
              });

            if (insertErr) {
              console.error("[Auth.js] Error creating profile:", insertErr);
            }
          }
        }
        return true;
      } catch (error) {
        console.error("[Auth.js] signIn callback exception:", error);
        return true;
      }
    },

    async jwt({ token, user, account }) {
      if (user?.email && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("auth_user_id")
            .eq("email", user.email)
            .maybeSingle();

          if (profile?.auth_user_id) {
            token.id = profile.auth_user_id;
          } else {
            token.id = user.id || account?.providerAccountId || user.email;
          }
        } catch {
          token.id = user.id || account?.providerAccountId || user.email;
        }
      } else if (user) {
        token.id = user.id || account?.providerAccountId || user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

import { auth } from "@/auth";
import { getCanonicalUserId } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

/**
 * Helper to authenticate requests and retrieve the canonical user ID from Supabase.
 * Use in API routes or Server Actions.
 *
 * @returns {Promise<{ session: object, user: object, userId: string, email: string } | null>}
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return null;
    }

    const userId = await getCanonicalUserId(session.user);

    return {
      session,
      user: session.user,
      userId,
      email: session.user.email,
    };
  } catch (error) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("DYNAMIC_SERVER_USAGE")) {
      throw error;
    }
    console.error("[auth-guard] Error getting authenticated user:", error?.message);
    return null;
  }
}

/**
 * Higher-order guard for Next.js Route Handlers.
 * Returns an unauthorized response directly if the user is not authenticated.
 */
export async function requireAuth() {
  const authData = await getAuthenticatedUser();
  if (!authData || !authData.userId) {
    return {
      authData: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة.",
          },
        },
        { status: 401 }
      ),
    };
  }

  return { authData, errorResponse: null };
}

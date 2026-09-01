import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { isExpressBackendEnabled } from "@/lib/backend-flag";
import { expressFetch } from "@/lib/express-client";

/**
 * POST /api/plans/[id]/retry-export
 * Retries Google Sheets & Drive export for a completed plan.
 * (Express-native endpoint; active when USE_EXPRESS_BACKEND=true)
 */
export async function POST(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { id: planId } = await params;

    if (!isExpressBackendEnabled(authData)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FEATURE_DISABLED",
            message: "ميزة إعادة تصدير Google Sheets المباشرة غير مفعلة في بيئة العمل الحالية.",
          },
        },
        { status: 501 }
      );
    }

    const expressRes = await expressFetch(`/api/v1/plans/${planId}/retry-export`, {
      method: "POST",
      authData,
    });

    return NextResponse.json(expressRes.data, { status: expressRes.status });
  } catch (err) {
    console.error("[POST /api/plans/[id]/retry-export] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء إعادة محاولة التصدير." } },
      { status: 500 }
    );
  }
}

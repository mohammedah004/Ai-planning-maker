import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { expressFetch } from "@/lib/express-client";

export async function POST(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { id: planId } = await params;
    const body = await request.json().catch(() => ({}));

    const expressRes = await expressFetch(`/api/v1/plans/${planId}/content/batch`, {
      method: "POST",
      body,
      authData,
    });

    return NextResponse.json(expressRes.data, { status: expressRes.status });
  } catch (err) {
    console.error("[POST /api/plans/[id]/content/batch] Proxy error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء تطبيق التعديل الجماعي." } },
      { status: 500 }
    );
  }
}

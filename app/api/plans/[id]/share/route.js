import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getBaseUrl(request) {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

/**
 * POST /api/plans/[id]/share
 * Generates or returns an existing public share token for the specified marketing plan.
 */
export async function POST(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: planId } = await params;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "معرف الخطة مطلوب." } },
        { status: 400 }
      );
    }

    // 1. Verify plan ownership
    const { data: plan, error: fetchErr } = await supabaseAdmin
      .from("marketing_plans")
      .select("id, share_token")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية مشاركتها." } },
        { status: 404 }
      );
    }

    const baseUrl = getBaseUrl(request);

    // 2. If token already exists, return existing URL
    if (plan.share_token) {
      return NextResponse.json({
        success: true,
        data: {
          shareToken: plan.share_token,
          shareUrl: `${baseUrl}/share/${plan.share_token}`,
        },
      });
    }

    // 3. Generate cryptographically secure UUIDv4 token
    const newShareToken = crypto.randomUUID();

    const { error: updateErr } = await supabaseAdmin
      .from("marketing_plans")
      .update({ share_token: newShareToken })
      .eq("id", planId)
      .eq("user_id", userId);

    if (updateErr) {
      console.error("[POST /api/plans/[id]/share] Error updating share token:", updateErr);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "فشل حفظ رابط المشاركة في قاعدة البيانات." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        shareToken: newShareToken,
        shareUrl: `${baseUrl}/share/${newShareToken}`,
      },
    });
  } catch (err) {
    console.error("[POST /api/plans/[id]/share] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء إنتاج رابط المشاركة." } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/[id]/share
 * Revokes public access to the specified plan immediately by setting `share_token = NULL`.
 */
export async function DELETE(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: planId } = await params;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "معرف الخطة مطلوب." } },
        { status: 400 }
      );
    }

    // 1. Verify ownership
    const { data: plan, error: fetchErr } = await supabaseAdmin
      .from("marketing_plans")
      .select("id")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية التحكم بها." } },
        { status: 404 }
      );
    }

    // 2. Set share_token = NULL
    const { error: updateErr } = await supabaseAdmin
      .from("marketing_plans")
      .update({ share_token: null })
      .eq("id", planId)
      .eq("user_id", userId);

    if (updateErr) {
      console.error("[DELETE /api/plans/[id]/share] Error revoking share token:", updateErr);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "فشل إيقاف رابط المشاركة في قاعدة البيانات." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إيقاف وإلغاء رابط المشاركة بنجاح.",
    });
  } catch (err) {
    console.error("[DELETE /api/plans/[id]/share] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء إيقاف المشاركة." } },
      { status: 500 }
    );
  }
}

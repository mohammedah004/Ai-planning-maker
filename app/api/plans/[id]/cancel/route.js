import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/plans/[id]/cancel
 * Marks the active generation job and plan as "failed" (Cancelled by user).
 * This releases the concurrency lock immediately so a new plan can be created.
 */
export async function POST(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: planId } = await params;

    // Verify ownership
    const { data: plan, error: fetchErr } = await supabaseAdmin
      .from("marketing_plans")
      .select("id, status")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية إلغائها." } },
        { status: 404 }
      );
    }

    const cancelledAt = new Date().toISOString();

    // 1. Mark all active generation jobs for this plan as failed
    const { error: jobErr } = await supabaseAdmin
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: "Cancelled by user",
        completed_at: cancelledAt,
      })
      .eq("marketing_plan_id", planId)
      .in("status", ["queued", "generating_strategy", "generating_pillars", "generating_content", "exporting_sheet"]);

    if (jobErr) {
      console.error("[POST /api/plans/:id/cancel] generation_jobs update error:", jobErr);
    }

    // 2. Mark the plan itself as failed to reflect UI state
    const { error: planErr } = await supabaseAdmin
      .from("marketing_plans")
      .update({ status: "failed", updated_at: cancelledAt })
      .eq("id", planId)
      .eq("user_id", userId);

    if (planErr) {
      console.error("[POST /api/plans/:id/cancel] marketing_plans update error:", planErr);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر تحديث حالة الخطة." } },
        { status: 500 }
      );
    }

    console.log(`[POST /api/plans/:id/cancel] Plan ${planId} cancelled by user ${userId}`);
    return NextResponse.json({ success: true, message: "تم إلغاء عملية التوليد وتحرير القفل بنجاح." });
  } catch (err) {
    console.error("[POST /api/plans/:id/cancel] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء الإلغاء." } },
      { status: 500 }
    );
  }
}

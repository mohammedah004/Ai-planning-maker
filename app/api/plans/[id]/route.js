import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin, getCanonicalUserId } from "@/lib/supabase-admin";

/**
 * DELETE /api/plans/[id]
 * Deletes a plan and ALL related records for the authenticated user.
 * Order: content_items → google_sheet_exports → generation_jobs → marketing_plans
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "يجب تسجيل الدخول لحذف الخطة." } },
        { status: 401 }
      );
    }

    const { id: planId } = await params;
    const userId = await getCanonicalUserId(session.user);

    // Verify ownership before deleting
    const { data: plan, error: fetchErr } = await supabaseAdmin
      .from("marketing_plans")
      .select("id")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية حذفها." } },
        { status: 404 }
      );
    }

    // 1. Delete content_items (if table exists)
    const { error: contentErr } = await supabaseAdmin
      .from("content_items")
      .delete()
      .eq("marketing_plan_id", planId);
    if (contentErr) {
      console.warn("[DELETE /api/plans/:id] content_items delete warning:", contentErr.message);
    }

    // 2. Delete google_sheet_exports
    const { error: sheetErr } = await supabaseAdmin
      .from("google_sheet_exports")
      .delete()
      .eq("marketing_plan_id", planId);
    if (sheetErr) {
      console.warn("[DELETE /api/plans/:id] google_sheet_exports delete warning:", sheetErr.message);
    }

    // 3. Delete generation_jobs
    const { error: jobErr } = await supabaseAdmin
      .from("generation_jobs")
      .delete()
      .eq("marketing_plan_id", planId);
    if (jobErr) {
      console.warn("[DELETE /api/plans/:id] generation_jobs delete warning:", jobErr.message);
    }

    // 4. Delete the marketing_plan itself
    const { error: planErr } = await supabaseAdmin
      .from("marketing_plans")
      .delete()
      .eq("id", planId)
      .eq("user_id", userId);

    if (planErr) {
      console.error("[DELETE /api/plans/:id] marketing_plans delete error:", planErr);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر حذف الخطة من قاعدة البيانات." } },
        { status: 500 }
      );
    }

    console.log(`[DELETE /api/plans/:id] Plan ${planId} deleted by user ${userId}`);
    return NextResponse.json({ success: true, message: "تم حذف الخطة وجميع بياناتها بنجاح." });
  } catch (err) {
    console.error("[DELETE /api/plans/:id] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء الحذف." } },
      { status: 500 }
    );
  }
}

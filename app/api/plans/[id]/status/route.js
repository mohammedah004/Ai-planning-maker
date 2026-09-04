import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isExpressBackendEnabled } from "@/lib/backend-flag";
import { expressFetch } from "@/lib/express-client";

/**
 * GET /api/plans/[id]/status
 * Polling endpoint to check live generation job status and Google Sheet export URL.
 * (Branches to Express backend if USE_EXPRESS_BACKEND=true, otherwise legacy DB polling)
 */
export async function GET(request, { params }) {
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

    // -------------------------------------------------------------
    // EXPRESS BACKEND BRANCH (Phase 5 Feature Flag)
    // -------------------------------------------------------------
    if (isExpressBackendEnabled(authData)) {
      const expressRes = await expressFetch(`/api/v1/plans/${planId}/status`, {
        method: "GET",
        authData,
      });

      if (!expressRes.ok) {
        return NextResponse.json(expressRes.data, { status: expressRes.status });
      }

      const ed = expressRes.data?.data || {};

      return NextResponse.json({
        success: true,
        data: {
          plan: {
            id: ed.planId,
            status: ed.planStatus,
          },
          job: {
            id: ed.planId,
            status: ed.jobStatus,
            current_step: ed.currentStep,
            error_message: ed.errorMessage,
          },
          export: {
            spreadsheet_url: ed.spreadsheetUrl,
            status: ed.exportStatus,
            error_message: ed.exportErrorMessage,
          },
        },
      });
    }

    // -------------------------------------------------------------
    // LEGACY SUPABASE POLLING QUERY (Untouched when flag is false)
    // -------------------------------------------------------------

    // Fetch plan verifying ownership
    const { data: plan, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .select(`
        id,
        user_id,
        product_name,
        product_category,
        marketing_objective,
        share_token,
        status,
        created_at,
        updated_at,
        strategy,
        content_pillars,
        objective_distribution,
        generation_jobs (
          id,
          status,
          current_step,
          error_message,
          started_at,
          completed_at
        ),
        google_sheet_exports (
          id,
          spreadsheet_id,
          spreadsheet_url,
          status,
          target_version,
          exported_version,
          error_message
        )
      `)
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة التسويقية غير موجودة أو غير مصرح لك بالوصول إليها." } },
        { status: 404 }
      );
    }

    const job = Array.isArray(plan.generation_jobs) ? plan.generation_jobs[0] : plan.generation_jobs;
    const sheetExport = Array.isArray(plan.google_sheet_exports)
      ? plan.google_sheet_exports[0]
      : plan.google_sheet_exports;

    return NextResponse.json({
      success: true,
      data: {
        plan: {
          id: plan.id,
          product_name: plan.product_name,
          product_category: plan.product_category,
          marketing_objective: plan.marketing_objective,
          shareToken: plan.share_token || null,
          status: plan.status,
          contentVersion: plan.content_version || 1,
          hasStrategy: Boolean(plan.strategy),
          hasPillars: Boolean(plan.content_pillars),
        },
        job: job
          ? {
              id: job.id,
              status: job.status,
              current_step: job.current_step,
              error_message: job.error_message,
              started_at: job.started_at,
              completed_at: job.completed_at,
            }
          : null,
        export: sheetExport
          ? {
              spreadsheet_url: sheetExport.spreadsheet_url,
              status: sheetExport.status,
              target_version: sheetExport.target_version,
              exported_version: sheetExport.exported_version,
              error_message: sheetExport.error_message,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[API /api/plans/[id]/status] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء الاستعلام عن حالة الخطة." } },
      { status: 500 }
    );
  }
}

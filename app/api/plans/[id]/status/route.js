import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin, getCanonicalUserId } from "@/lib/supabase-admin";

/**
 * GET /api/plans/[id]/status
 * Polling endpoint to check live generation job status and Google Sheet export URL.
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
        { status: 401 }
      );
    }

    const userId = await getCanonicalUserId(session.user);
    const { id: planId } = await params;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Plan ID is required." } },
        { status: 400 }
      );
    }

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
          error_message
        )
      `)
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Marketing plan not found or unauthorized." } },
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
              error_message: sheetExport.error_message,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[API /api/plans/[id]/status] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to poll generation status." } },
      { status: 500 }
    );
  }
}

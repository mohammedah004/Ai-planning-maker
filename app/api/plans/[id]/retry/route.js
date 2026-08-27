import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin, getCanonicalUserId } from "@/lib/supabase-admin";

/**
 * POST /api/plans/[id]/retry
 * Restarts a failed generation job and re-triggers the n8n pipeline.
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
        { status: 401 }
      );
    }

    const { id: planId } = await params;
    const userId = await getCanonicalUserId(session.user);

    // 1. Verify plan ownership
    const { data: plan, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .select("*")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Plan not found or unauthorized." } },
        { status: 404 }
      );
    }

    // 2. Reset plan status
    await supabaseAdmin
      .from("marketing_plans")
      .update({ status: "generating", updated_at: new Date().toISOString() })
      .eq("id", planId);

    // 3. Upsert / reset generation job
    const { data: jobRecord, error: jobError } = await supabaseAdmin
      .from("generation_jobs")
      .upsert(
        {
          marketing_plan_id: planId,
          user_id: session.user.id,
          status: "queued",
          current_step: "Restarting generation pipeline...",
          error_message: null,
          started_at: new Date().toISOString(),
          completed_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "marketing_plan_id" }
      )
      .select("id")
      .single();

    const jobId = jobRecord?.id || planId;

    // 4. Re-fire n8n Webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (webhookUrl) {
      try {
        const payload = {
          jobId,
          planId: plan.id,
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name || "User",
          plan: {
            product_name: plan.product_name,
            product_description: plan.product_description,
            product_category: plan.product_category,
            target_audience: plan.target_audience,
            problem_solved: plan.problem_solved,
            marketing_objective: plan.marketing_objective,
            brand_tone: plan.brand_tone,
            website_url: plan.website_url,
            additional_context: plan.additional_context,
          },
          isRetry: true,
          createdAt: new Date().toISOString(),
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
          },
          body: JSON.stringify(payload),
        }).catch((err) => console.error("[API Retry] Webhook fetch error:", err));
      } catch (webhookErr) {
        console.error("[API Retry] Webhook dispatch exception:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Plan generation restarted successfully.",
    });
  } catch (err) {
    console.error("[API Retry] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to retry generation." } },
      { status: 500 }
    );
  }
}

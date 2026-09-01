import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isExpressBackendEnabled } from "@/lib/backend-flag";
import { expressFetch } from "@/lib/express-client";

/**
 * POST /api/plans/[id]/retry
 * Restarts a failed generation job and re-triggers the plan generation pipeline.
 * (Branches to Express backend if USE_EXPRESS_BACKEND=true, otherwise legacy n8n webhook)
 */
export async function POST(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId, user } = authData;
    const { id: planId } = await params;

    // -------------------------------------------------------------
    // EXPRESS BACKEND BRANCH (Phase 5 Feature Flag)
    // -------------------------------------------------------------
    if (isExpressBackendEnabled(authData)) {
      const expressRes = await expressFetch(`/api/v1/plans/${planId}/retry`, {
        method: "POST",
        authData,
      });

      if (!expressRes.ok) {
        return NextResponse.json(expressRes.data, { status: expressRes.status });
      }

      return NextResponse.json({
        success: true,
        message: expressRes.data?.message || "تمت إعادة تشغيل عملية التوليد بنجاح.",
        data: expressRes.data?.data || null,
      });
    }

    // -------------------------------------------------------------
    // LEGACY N8N RETRY PIPELINE (Untouched when flag is false)
    // -------------------------------------------------------------

    // 1. Verify plan ownership
    const { data: plan, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .select("*")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية إعادة تشغيلها." } },
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
          user_id: userId,
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

    if (jobError) {
      console.error("[API Retry] Failed to upsert generation_jobs record:", jobError);
    }

    const jobId = jobRecord?.id || planId;

    // 4. Re-fire n8n Webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (webhookUrl) {
      try {
        const payload = {
          jobId,
          planId: plan.id,
          userId,
          userEmail: user.email,
          userName: user.name || "User",
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
      message: "تمت إعادة تشغيل عملية التوليد بنجاح.",
    });
  } catch (err) {
    console.error("[API Retry] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء إعادة المحاولة." } },
      { status: 500 }
    );
  }
}

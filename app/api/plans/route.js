import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin, getCanonicalUserId } from "@/lib/supabase-admin";
import { validatePlanInput } from "@/lib/validations/plan";

/**
 * POST /api/plans
 * Creates a new marketing plan, records a generation job, and triggers n8n webhook.
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "يجب تسجيل الدخول لإنشاء خطة تسويقية." } },
        { status: 401 }
      );
    }

    const userId = await getCanonicalUserId(session.user);
    const body = await request.json();

    // 1. Validation & Sanitization
    const validation = validatePlanInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "يرجى مراجعة الحقول المدخلة والتأكد من صحتها.",
            fields: validation.errors,
          },
        },
        { status: 400 }
      );
    }

    const { sanitizedData } = validation;

    // 2. Concurrency / Rate Limiting Check with Stale Job Auto-Recovery
    // Jobs older than 5 minutes are considered stale (n8n timed out) and auto-failed.
    const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const staleBeforeISO = new Date(Date.now() - STALE_THRESHOLD_MS).toISOString();

    const { data: activeJobs, error: activeJobError } = await supabaseAdmin
      .from("generation_jobs")
      .select("id, status, started_at, created_at")
      .eq("user_id", userId)
      .in("status", [
        "queued",
        "generating_strategy",
        "generating_pillars",
        "generating_content",
        "exporting_sheet",
      ])
      .limit(5);

    if (activeJobError) {
      console.error("[API /api/plans] Error checking active jobs:", activeJobError);
    } else if (activeJobs && activeJobs.length > 0) {
      // Separate stale vs. fresh jobs
      const staleJobs = activeJobs.filter((j) => {
        const refTime = j.started_at || j.created_at;
        return refTime && new Date(refTime) < new Date(staleBeforeISO);
      });
      const freshJobs = activeJobs.filter((j) => !staleJobs.find((s) => s.id === j.id));

      // Auto-recover stale jobs: mark them as failed so the lock is released
      if (staleJobs.length > 0) {
        const staleIds = staleJobs.map((j) => j.id);
        console.warn(`[API /api/plans] Auto-recovering ${staleIds.length} stale job(s):`, staleIds);

        const { error: recoverErr } = await supabaseAdmin
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: "Generation timed out due to workflow inactivity",
            completed_at: new Date().toISOString(),
          })
          .in("id", staleIds);

        if (recoverErr) {
          console.error("[API /api/plans] Failed to auto-recover stale jobs:", recoverErr);
        }
      }

      // Only block if there are FRESH (non-stale) active jobs
      if (freshJobs.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "JOB_IN_PROGRESS",
              message: "لديك خطة تسويقية قيد المعالجة والتوليد حالياً. يرجى الانتظار حتى تكتمل أو إلغاءها.",
            },
          },
          { status: 409 }
        );
      }
    }

    // 3. Create the marketing_plans record
    const { data: planRecord, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .insert({
        user_id: userId,
        product_name: sanitizedData.product_name,
        product_description: sanitizedData.product_description,
        product_category: sanitizedData.product_category,
        target_audience: sanitizedData.target_audience,
        problem_solved: sanitizedData.problem_solved,
        marketing_objective: sanitizedData.marketing_objective,
        brand_tone: sanitizedData.brand_tone,
        website_url: sanitizedData.website_url,
        additional_context: sanitizedData.additional_context,
        status: "generating",
      })
      .select("id")
      .single();

    if (planError || !planRecord) {
      console.error("[API /api/plans] Database insertion error for marketing_plans:", planError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DB_ERROR", message: "Failed to initialize marketing plan record in database." },
        },
        { status: 500 }
      );
    }

    const planId = planRecord.id;

    // 4. Create the generation_jobs record
    const { data: jobRecord, error: jobError } = await supabaseAdmin
      .from("generation_jobs")
      .insert({
        user_id: userId,
        marketing_plan_id: planId,
        status: "queued",
        current_step: "Queued for generation",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (jobError || !jobRecord) {
      console.error("[API /api/plans] Database insertion error for generation_jobs:", jobError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DB_ERROR", message: "Failed to initialize generation job." },
        },
        { status: 500 }
      );
    }

    const jobId = jobRecord.id;

    // 5. Initialize google_sheet_exports placeholder record
    const { error: sheetError } = await supabaseAdmin
      .from("google_sheet_exports")
      .insert({
        user_id: userId,
        marketing_plan_id: planId,
        status: "pending",
      });

    if (sheetError) {
      console.warn("[API /api/plans] Warning: Failed to pre-seed google_sheet_exports:", sheetError);
    }

    // 6. Trigger n8n Webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookUrl) {
      console.error("[n8n] ❌ N8N_WEBHOOK_URL is not set in environment variables. Webhook skipped.");
    } else {
      const payload = {
        jobId,
        planId,
        userId,
        userEmail: session.user.email,
        userName: session.user.name || "User",
        plan: sanitizedData,
        createdAt: new Date().toISOString(),
      };

      const headers = {
        "Content-Type": "application/json",
        ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
      };

      console.log("[n8n] 🚀 Firing webhook:");
      console.log("[n8n]   URL     :", webhookUrl);
      console.log("[n8n]   Headers :", JSON.stringify(headers));
      console.log("[n8n]   Payload :", JSON.stringify(payload, null, 2));

      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          // Give n8n up to 10s to acknowledge before we respond to client
          signal: AbortSignal.timeout(10_000),
        });

        const responseText = await webhookRes.text();
        console.log("[n8n] ✅ Webhook response:", webhookRes.status, responseText);

        if (!webhookRes.ok) {
          console.error(`[n8n] ❌ Webhook returned non-2xx status ${webhookRes.status}:`, responseText);
        }
      } catch (webhookErr) {
        // Log the full error but do NOT block the client response — the job is queued in DB
        console.error("[n8n] ❌ Webhook fetch failed:", webhookErr?.name, webhookErr?.message);
        if (webhookErr?.cause) console.error("[n8n]   cause:", webhookErr.cause);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          planId,
          jobId,
          status: "queued",
          message: "Marketing plan created and queued for AI generation.",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API /api/plans] Unhandled exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "An unexpected error occurred while creating your plan." },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/plans
 * Retrieves a list of marketing plans created by the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to view your plans." } },
        { status: 401 }
      );
    }

    const userId = await getCanonicalUserId(session.user);

    const { data: plans, error } = await supabaseAdmin
      .from("marketing_plans")
      .select(`
        id,
        product_name,
        product_category,
        marketing_objective,
        status,
        created_at,
        updated_at,
        google_sheet_exports (
          spreadsheet_url,
          status
        ),
        generation_jobs (
          status,
          current_step,
          error_message
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API /api/plans GET] Error fetching plans:", error);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "Failed to retrieve plans from database." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plans || [],
    });
  } catch (err) {
    console.error("[API /api/plans GET] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

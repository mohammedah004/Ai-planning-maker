import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";

function safeJson(val, fallback = null) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * GET /api/plans/[id]/content
 * Retrieves the full strategic plan data (strategy, content_pillars, objective_distribution),
 * all 30 generated content items ordered by day_number ASC,
 * and memory data (preceding plan for the same brand) for comparative intelligence.
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

    // 1. Fetch Plan details & strategy verifying ownership
    const { data: plan, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .select(`
        id,
        user_id,
        brand_profile_id,
        product_name,
        product_description,
        product_category,
        target_audience,
        problem_solved,
        marketing_objective,
        brand_tone,
        website_url,
        additional_context,
        strategy,
        content_pillars,
        objective_distribution,
        share_token,
        status,
        created_at,
        updated_at,
        google_sheet_exports (
          spreadsheet_url,
          status
        )
      `)
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية الوصول إليها." } },
        { status: 404 }
      );
    }

    // 2. Fetch all content items for this plan
    const { data: rawItems, error: itemsError } = await supabaseAdmin
      .from("content_items")
      .select("*")
      .eq("marketing_plan_id", planId)
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    if (itemsError) {
      console.error("[GET /api/plans/[id]/content] Error fetching content items:", itemsError);
    }

    // 3. Phase 2 Memory: Fetch previous plan for the same brand if brand_profile_id exists
    let previousPlan = null;
    let previousItems = [];

    if (plan.brand_profile_id) {
      const { data: prevPlanRecord } = await supabaseAdmin
        .from("marketing_plans")
        .select("id, product_name, marketing_objective, strategy, content_pillars, objective_distribution, created_at, status")
        .eq("brand_profile_id", plan.brand_profile_id)
        .eq("user_id", userId)
        .eq("status", "completed")
        .neq("id", planId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevPlanRecord) {
        previousPlan = {
          id: prevPlanRecord.id,
          productName: prevPlanRecord.product_name,
          marketingObjective: prevPlanRecord.marketing_objective,
          strategy: safeJson(prevPlanRecord.strategy, {}),
          contentPillars: safeJson(prevPlanRecord.content_pillars, []),
          objectiveDistribution: safeJson(prevPlanRecord.objective_distribution, {}),
          createdAt: prevPlanRecord.created_at,
        };

        const { data: prevItemsRecord } = await supabaseAdmin
          .from("content_items")
          .select("id, day_number, post_type, content_objective, content_pillar")
          .eq("marketing_plan_id", prevPlanRecord.id)
          .eq("user_id", userId)
          .order("day_number", { ascending: true });

        if (prevItemsRecord) {
          previousItems = prevItemsRecord.map((item) => ({
            id: item.id,
            dayNumber: item.day_number,
            postType: item.post_type,
            contentObjective: item.content_objective,
            contentPillar: item.content_pillar,
          }));
        }
      }
    }

    // 4. Format and safely parse nested JSON structures
    const parsedStrategy = safeJson(plan.strategy, {});
    const parsedPillars = safeJson(plan.content_pillars, []);
    const parsedObjDist = safeJson(plan.objective_distribution, {});

    const sheetExport = Array.isArray(plan.google_sheet_exports)
      ? plan.google_sheet_exports[0]
      : plan.google_sheet_exports;

    const contentItems = (rawItems || []).map((item) => ({
      id: item.id,
      dayNumber: item.day_number,
      caption: item.caption,
      designCopy: safeJson(item.design_copy, { headline: "", subtext: "", cta: "" }),
      postType: item.post_type,
      contentObjective: item.content_objective,
      contentPillar: item.content_pillar,
      designReference: item.design_reference,
      cta: item.cta,
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        plan: {
          id: plan.id,
          brandProfileId: plan.brand_profile_id || null,
          productName: plan.product_name,
          productDescription: plan.product_description,
          productCategory: plan.product_category,
          targetAudience: plan.target_audience,
          problemSolved: plan.problem_solved,
          marketingObjective: plan.marketing_objective,
          brandTone: plan.brand_tone,
          websiteUrl: plan.website_url,
          additionalContext: plan.additional_context,
          shareToken: plan.share_token || null,
          status: plan.status,
          createdAt: plan.created_at,
          sheetUrl: sheetExport?.spreadsheet_url || null,
        },
        strategy: parsedStrategy,
        pillars: Array.isArray(parsedPillars) ? parsedPillars : [],
        objectiveDistribution: parsedObjDist,
        contentItems,
        // Phase 2: Memory Context
        memory: {
          hasPreviousPlan: Boolean(previousPlan),
          previousPlan,
          previousItems,
        },
      },
    });
  } catch (err) {
    console.error("[GET /api/plans/[id]/content] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء جلب محتوى الخطة." } },
      { status: 500 }
    );
  }
}

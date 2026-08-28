import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";

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
 * GET /api/share/[token]
 * PUBLIC ENDPOINT (No authentication required)
 * Retrieves public read-only details of a shared marketing plan and its 30 content items.
 */
export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "رمز المشاركة مطلوب." } },
        { status: 400 }
      );
    }

    // 1. Rate Limiting for Public Endpoint (30 requests per minute)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateCheck = checkRateLimit(`public_share_${clientIp}_${token}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "تم تجاوز عدد الزيارات المسموح به مؤقتاً. يرجى إعادة المحاولة بعد دقيقة.",
          },
        },
        { status: 429 }
      );
    }

    // 2. Fetch Plan where share_token = token
    // EXCLUDE user_id, job info, or any sensitive columns
    const { data: plan, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .select(`
        id,
        product_name,
        product_category,
        marketing_objective,
        brand_tone,
        strategy,
        content_pillars,
        objective_distribution,
        created_at
      `)
      .eq("share_token", token)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "الخطة المطلوبة غير موجودة أو أن رابط المشاركة قد تم إيقافه.",
          },
        },
        { status: 404 }
      );
    }

    // 3. Fetch associated content items ordered by day_number ASC
    const { data: rawItems, error: itemsError } = await supabaseAdmin
      .from("content_items")
      .select("id, day_number, caption, design_copy, post_type, content_objective, content_pillar, design_reference, cta, created_at")
      .eq("marketing_plan_id", plan.id)
      .order("day_number", { ascending: true });

    if (itemsError) {
      console.error("[GET /api/share/[token]] Error fetching content items:", itemsError);
    }

    // 4. Safely parse JSON fields
    const parsedStrategy = safeJson(plan.strategy, {});
    const parsedPillars = safeJson(plan.content_pillars, []);
    const parsedObjDist = safeJson(plan.objective_distribution, {});

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
          productName: plan.product_name,
          productCategory: plan.product_category,
          marketingObjective: plan.marketing_objective,
          brandTone: plan.brand_tone,
          createdAt: plan.created_at,
        },
        strategy: parsedStrategy,
        pillars: Array.isArray(parsedPillars) ? parsedPillars : [],
        objectiveDistribution: parsedObjDist,
        contentItems,
      },
    });
  } catch (err) {
    console.error("[GET /api/share/[token]] Unhandled exception:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء عرض الخطة المشاركة." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_POST_TYPES = ["reel", "carousel", "static_post", "story"];
const ALLOWED_OBJECTIVES = [
  "awareness",
  "education",
  "engagement",
  "trust",
  "social_proof",
  "objection_handling",
  "conversion",
];

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
 * POST /api/plans/[id]/content/[dayNumber]/regenerate
 * Regenerates a single post for a specific day while keeping strategic context intact.
 */
export async function POST(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: planId, dayNumber: rawDayNumber } = await params;
    const dayNumber = parseInt(rawDayNumber, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_DAY", message: "رقم اليوم يجب أن يكون بين 1 و 30." } },
        { status: 400 }
      );
    }

    // 1. Rate Limiting Check (Max 10 per hour per user)
    const rateLimit = checkRateLimit(userId, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `لقد تجاوزت الحد الأقصى لإعادة التوليد (10 مرات في الساعة). يرجى الانتظار ${rateLimit.resetMinutes} دقيقة قبل المحاولة مجدداً.`,
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const instruction = typeof body?.instruction === "string" ? body.instruction.trim().slice(0, 500) : "";
    const requestedPostType = body?.post_type && ALLOWED_POST_TYPES.includes(body.post_type) ? body.post_type : null;
    const requestedObjective = body?.content_objective && ALLOWED_OBJECTIVES.includes(body.content_objective) ? body.content_objective : null;

    // 2. Fetch Parent Plan & Verify Ownership
    const { data: plan, error: planError } = await supabaseAdmin
      .from("marketing_plans")
      .select("id, product_name, product_description, product_category, target_audience, problem_solved, brand_tone, website_url, strategy, content_pillars")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "الخطة غير موجودة أو لا تملك صلاحية التعديل." } },
        { status: 404 }
      );
    }

    // 3. Fetch Current Content Item
    const { data: currentItem, error: itemError } = await supabaseAdmin
      .from("content_items")
      .select("*")
      .eq("marketing_plan_id", planId)
      .eq("day_number", dayNumber)
      .eq("user_id", userId)
      .single();

    if (itemError || !currentItem) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: `منشور اليوم ${dayNumber} غير موجود في هذه الخطة.` } },
        { status: 404 }
      );
    }

    // 4. Check OpenAI API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "API_KEY_MISSING",
            message: "مفتاح OPENAI_API_KEY غير متوفر في إعدادات البيئة لتشغيل التوليد الفوري.",
          },
        },
        { status: 503 }
      );
    }

    // 5. Build Targeted Regeneration Prompt
    const parsedStrategy = safeJson(plan.strategy, {});
    const parsedPillars = safeJson(plan.content_pillars, []);
    const currentDesignCopy = safeJson(currentItem.design_copy, {});

    const targetPostType = requestedPostType || currentItem.post_type || "reel";
    const targetObjective = requestedObjective || currentItem.content_objective || "awareness";
    const targetPillar = currentItem.content_pillar || (parsedPillars[0]?.name || "الأساس التسويقي");

    const systemPrompt = `أنت خبير استراتيجي أول في التسويق بالمحتوى وكتابة الإعلانات على إنستغرام.
مهمتك: إعادة صياغة وتوليد منشور واحد محدد لليوم رقم (${dayNumber}) ضمن خطة تسويقية لـ 30 يوماً.
يجب الحفاظ على التناغم الاستراتيجي مع هوية البراند والجمهور مع تطبيق تعديلات المستخدم بدقة.

يجب أن تكون المخرجات كائن JSON صارم ومكتمل يحتوي على الحقول التالية فقط:
{
  "caption": "نص الكابشن الكامل الجذاب والمهيأ لإنستغرام باللغة العربية مع إيموجي مناسب وخطاف قوي في البداية",
  "design_copy": {
    "headline": "العنوان الرئيسي القصير الجذاب المكتوب داخل الصورة/الفيديو",
    "subtext": "النص التوضيحي المساعد داخل التصميم",
    "cta": "النص المكتوب على زر التصميم (مثل: اطلب الآن / اضغط الرابط)"
  },
  "post_type": "${targetPostType}",
  "content_objective": "${targetObjective}",
  "content_pillar": "${targetPillar}",
  "design_reference": "توجيه بصري وإخراجي مفصل وواضح للمصمم أو المونتير يشمل المشهد، زاوية التصوير، والإضاءة",
  "cta": "الدعوة الإعلانية لاتخاذ الإجراء الموجهة في نهاية الكابشن"
}`;

    const userPrompt = `### سياق البراند:
- اسم المنتج/البراند: ${plan.product_name}
- وصف المنتج: ${plan.product_description}
- الجمهور المستهدف: ${plan.target_audience}
- المشكلة المحلولة: ${plan.problem_solved}
- نبرة البراند: ${(plan.brand_tone || []).join(", ")}
- رابط الموقع: ${plan.website_url || "غير محدد"}

### الاستراتيجية المعتمدة:
- تموضع البراند: ${parsedStrategy.positioning || "غير محدد"}
- زوايا الخطاب: ${(parsedStrategy.messaging_angles || []).join(" | ")}

### المنشور الحالي لليوم (${dayNumber}):
- نوع المنشور: ${currentItem.post_type}
- الهدف: ${currentItem.content_objective}
- المحور: ${currentItem.content_pillar}
- الكابشن الحالي: ${currentItem.caption}
- العنوان في التصميم: ${currentDesignCopy.headline || ""}
- التوجيه البصري: ${currentItem.design_reference}

### التعديلات والتعليمات المطلوبة من المستخدم:
${instruction ? `👉 تعليمات المستخدم الخاصة: "${instruction}"` : "👉 أعد صياغة المنشور بأسلوب أكثر جاذبية وقوة وإقناعاً."}
${requestedPostType ? `👉 تغيير نوع القالب البصري إلى: ${requestedPostType}` : ""}
${requestedObjective ? `👉 تغيير الهدف التسويقي إلى: ${requestedObjective}` : ""}

أعد توليد المنشور بصيغة JSON مطابقة تماماً للشروط.`;

    // 6. Execute Direct OpenAI Call
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("[Regenerate Post] OpenAI Error:", aiResponse.status, errText);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_GENERATION_FAILED",
            message: "تعذر توليد النسخة الجديدة عبر مزود الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
          },
        },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    const generated = safeJson(rawContent, null);

    if (!generated || !generated.caption) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_AI_RESPONSE", message: "تعذر قراءة مخرجات الذكاء الاصطناعي بدقة." } },
        { status: 500 }
      );
    }

    // 7. Update the single row in content_items table
    const updatePayload = {
      caption: generated.caption,
      design_copy: typeof generated.design_copy === "object" ? JSON.stringify(generated.design_copy) : generated.design_copy,
      post_type: generated.post_type || targetPostType,
      content_objective: generated.content_objective || targetObjective,
      content_pillar: generated.content_pillar || targetPillar,
      design_reference: generated.design_reference || currentItem.design_reference,
      cta: generated.cta || currentItem.cta,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRow, error: updateError } = await supabaseAdmin
      .from("content_items")
      .update(updatePayload)
      .eq("id", currentItem.id)
      .eq("marketing_plan_id", planId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError || !updatedRow) {
      console.error("[Regenerate Post] Database update error:", updateError);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر حفظ التعديلات في قاعدة البيانات." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `تمت إعادة صياغة منشور اليوم ${dayNumber} بنجاح!`,
      data: {
        id: updatedRow.id,
        dayNumber: updatedRow.day_number,
        caption: updatedRow.caption,
        designCopy: safeJson(updatedRow.design_copy, { headline: "", subtext: "", cta: "" }),
        postType: updatedRow.post_type,
        contentObjective: updatedRow.content_objective,
        contentPillar: updatedRow.content_pillar,
        designReference: updatedRow.design_reference,
        cta: updatedRow.cta,
        updatedAt: updatedRow.updated_at,
      },
      remaining: rateLimit.remaining,
    });
  } catch (err) {
    console.error("[Regenerate Post] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع أثناء معالجة الطلب." } },
      { status: 500 }
    );
  }
}

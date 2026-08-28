import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateBrandInput } from "@/lib/validations/brand";

/**
 * GET /api/brands
 * Returns all brand profiles for the authenticated user, ordered by is_default DESC, created_at DESC.
 */
export async function GET() {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;

    const { data: brands, error } = await supabaseAdmin
      .from("brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/brands] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر جلب ملفات البراند." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brands || [],
    });
  } catch (err) {
    console.error("[GET /api/brands] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع." } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands
 * Creates a new brand profile for the authenticated user.
 */
export async function POST(request) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const body = await request.json();

    const validation = validateBrandInput(body);
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

    // If is_default is set to true, unset is_default on other brands of this user
    if (sanitizedData.is_default) {
      await supabaseAdmin
        .from("brand_profiles")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data: newBrand, error } = await supabaseAdmin
      .from("brand_profiles")
      .insert({
        user_id: userId,
        name: sanitizedData.name,
        product_name: sanitizedData.product_name,
        product_description: sanitizedData.product_description,
        product_category: sanitizedData.product_category,
        target_audience: sanitizedData.target_audience,
        problem_solved: sanitizedData.problem_solved,
        brand_tone: sanitizedData.brand_tone,
        website_url: sanitizedData.website_url,
        additional_context: sanitizedData.additional_context,
        is_default: sanitizedData.is_default,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/brands] Insert error:", error);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر حفظ ملف البراند في قاعدة البيانات." } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newBrand,
        message: "تم إنشاء ملف البراند بنجاح.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/brands] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateBrandInput } from "@/lib/validations/brand";

/**
 * GET /api/brands/[id]
 * Retrieves a single brand profile owned by the authenticated user.
 */
export async function GET(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: brandId } = await params;

    const { data: brand, error } = await supabaseAdmin
      .from("brand_profiles")
      .select("*")
      .eq("id", brandId)
      .eq("user_id", userId)
      .single();

    if (error || !brand) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "ملف البراند غير موجود أو ليس لديك صلاحية الوصول إليه." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (err) {
    console.error("[GET /api/brands/[id]] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع." } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/brands/[id]
 * Updates an existing brand profile owned by the authenticated user.
 */
export async function PUT(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: brandId } = await params;
    const body = await request.json();

    // 1. Verify ownership first
    const { data: existingBrand, error: fetchError } = await supabaseAdmin
      .from("brand_profiles")
      .select("id")
      .eq("id", brandId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingBrand) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "ملف البراند غير موجود أو ليس لديك صلاحية تعديله." } },
        { status: 404 }
      );
    }

    // 2. Validate input
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

    // 3. Unset previous defaults if this brand is marked as default
    if (sanitizedData.is_default) {
      await supabaseAdmin
        .from("brand_profiles")
        .update({ is_default: false })
        .eq("user_id", userId)
        .neq("id", brandId);
    }

    // 4. Update the brand profile
    const { data: updatedBrand, error: updateError } = await supabaseAdmin
      .from("brand_profiles")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", brandId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("[PUT /api/brands/[id]] Update error:", updateError);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر تحديث بيانات البراند." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBrand,
      message: "تم تحديث ملف البراند بنجاح.",
    });
  } catch (err) {
    console.error("[PUT /api/brands/[id]] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع." } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/brands/[id]
 * Deletes a brand profile owned by the authenticated user.
 */
export async function DELETE(request, { params }) {
  try {
    const { authData, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { userId } = authData;
    const { id: brandId } = await params;

    // Verify ownership and delete
    const { error } = await supabaseAdmin
      .from("brand_profiles")
      .delete()
      .eq("id", brandId)
      .eq("user_id", userId);

    if (error) {
      console.error("[DELETE /api/brands/[id]] Delete error:", error);
      return NextResponse.json(
        { success: false, error: { code: "DB_ERROR", message: "تعذر حذف ملف البراند." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف ملف البراند بنجاح.",
    });
  } catch (err) {
    console.error("[DELETE /api/brands/[id]] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ غير متوقع." } },
      { status: 500 }
    );
  }
}

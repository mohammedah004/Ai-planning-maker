export const PRODUCT_CATEGORIES = [
  "منتجات مادية / تجارة إلكترونية",
  "منتج رقمي / دورة تدريبية",
  "برمجيات / SaaS",
  "خدمات / وكالة واستشارات",
  "مطاعم / أطعمة ومشروبات",
  "أزياء ومستحضرات تجميل",
  "صحة وتغذية ولياقة بدنية",
  "تعليم وتدريب",
  "عقارات ومقاولات",
  "صانع محتوى / براند شخصي",
  "أخرى",
];

export const MARKETING_OBJECTIVES = [
  { value: "brand_awareness", label: "زيادة الوعي بالعلامة التجارية (Awareness)" },
  { value: "audience_engagement", label: "زيادة التفاعل وبناء المجتمع (Engagement)" },
  { value: "lead_generation", label: "جلب عملاء محتملين مهتمين (Lead Generation)" },
  { value: "direct_sales", label: "زيادة المبيعات المباشرة (Direct Sales)" },
  { value: "product_launch", label: "إطلاق منتج جديد في السوق (Product Launch)" },
  { value: "brand_building", label: "بناء وترسيخ هوية ومكانة البراند (Brand Building)" },
];

export const BRAND_TONES = [
  "احترافي ورسمي",
  "ودود وقريب للقلب",
  "جريء وحماسي",
  "فاخر ومميز (Luxury)",
  "تعليمي ومبسط",
  "شبابي وعصري",
  "عفوي وغير متكلف",
  "مباشر ومقنع",
  "ملهم ومحفز",
];

/**
 * Validates and sanitizes plan creation form data with Arabic error messages.
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitizedData: Object }}
 */
export function validatePlanInput(data) {
  const errors = {};
  const sanitized = {};

  // 1. Product Name (Required, 2-120 chars)
  if (!data?.product_name || typeof data.product_name !== "string" || !data.product_name.trim()) {
    errors.product_name = "يرجى كتابة اسم المنتج أو البراند.";
  } else {
    const trimmed = data.product_name.trim();
    if (trimmed.length < 2) {
      errors.product_name = "اسم المنتج يجب أن يتكون من حرفين على الأقل.";
    } else if (trimmed.length > 120) {
      errors.product_name = "اسم المنتج طويل جداً (الحد الأقصى 120 حرفاً).";
    } else {
      sanitized.product_name = trimmed;
    }
  }

  // 2. Product Description (Required, 10-2000 chars)
  if (!data?.product_description || typeof data.product_description !== "string" || !data.product_description.trim()) {
    errors.product_description = "يرجى كتابة وصف تفصيلي للمنتج.";
  } else {
    const trimmed = data.product_description.trim();
    if (trimmed.length < 10) {
      errors.product_description = "يرجى تقديم تفاصيل أكثر عن المنتج (10 أحرف على الأقل).";
    } else if (trimmed.length > 2000) {
      errors.product_description = "وصف المنتج طويل جداً (الحد الأقصى 2000 حرف).";
    } else {
      sanitized.product_description = trimmed;
    }
  }

  // 3. Product Category (Required, must be in enum list)
  if (!data?.product_category || !PRODUCT_CATEGORIES.includes(data.product_category)) {
    errors.product_category = "يرجى اختيار تصنيف صالح للمنتج.";
  } else {
    sanitized.product_category = data.product_category;
  }

  // 4. Target Audience (Required, 5-1000 chars)
  if (!data?.target_audience || typeof data.target_audience !== "string" || !data.target_audience.trim()) {
    errors.target_audience = "يرجى توضيح الشريحة والجمهور المستهدف.";
  } else {
    const trimmed = data.target_audience.trim();
    if (trimmed.length < 5) {
      errors.target_audience = "يرجى وصف الجمهور المستهدف بتفاصيل أكثر (5 أحرف على الأقل).";
    } else if (trimmed.length > 1000) {
      errors.target_audience = "وصف الجمهور طويل جداً (الحد الأقصى 1000 حرف).";
    } else {
      sanitized.target_audience = trimmed;
    }
  }

  // 5. Problem It Solves (Required, 5-1000 chars)
  if (!data?.problem_solved || typeof data.problem_solved !== "string" || !data.problem_solved.trim()) {
    errors.problem_solved = "يرجى شرح المشكلة أو الفجوة التي يحلها المنتج.";
  } else {
    const trimmed = data.problem_solved.trim();
    if (trimmed.length < 5) {
      errors.problem_solved = "يرجى شرح المشكلة بتفاصيل أوضح (5 أحرف على الأقل).";
    } else if (trimmed.length > 1000) {
      errors.problem_solved = "شرح المشكلة طويل جداً (الحد الأقصى 1000 حرف).";
    } else {
      sanitized.problem_solved = trimmed;
    }
  }

  // 6. Marketing Objective (Required, must be in enum list)
  const validObjectives = MARKETING_OBJECTIVES.map((o) => o.value);
  if (!data?.marketing_objective || !validObjectives.includes(data.marketing_objective)) {
    errors.marketing_objective = "يرجى اختيار الهدف التسويقي الأساسي.";
  } else {
    sanitized.marketing_objective = data.marketing_objective;
  }

  // 7. Brand Tone (Required, Array of 1-3 items)
  if (!Array.isArray(data?.brand_tone) || data.brand_tone.length === 0) {
    errors.brand_tone = "يرجى اختيار نبرة براند واحدة على الأقل.";
  } else if (data.brand_tone.length > 3) {
    errors.brand_tone = "يمكنك اختيار 3 نبرات كحد أقصى.";
  } else {
    const invalidTones = data.brand_tone.filter((tone) => !BRAND_TONES.includes(tone));
    if (invalidTones.length > 0) {
      errors.brand_tone = "النبرات المختارة تحتوي على خيارات غير صالحة.";
    } else {
      sanitized.brand_tone = data.brand_tone;
    }
  }

  // 8. Website / Product URL (Optional, max 500 chars, valid URL format if provided)
  if (data?.website_url && typeof data.website_url === "string" && data.website_url.trim()) {
    const trimmedUrl = data.website_url.trim();
    try {
      const urlObj = new URL(trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`);
      sanitized.website_url = urlObj.href;
    } catch {
      errors.website_url = "يرجى إدخال رابط صالح (مثال: https://example.com).";
    }
  } else {
    sanitized.website_url = null;
  }

  // 9. Additional Context (Optional, max 2000 chars)
  if (data?.additional_context && typeof data.additional_context === "string" && data.additional_context.trim()) {
    const trimmedContext = data.additional_context.trim();
    if (trimmedContext.length > 2000) {
      errors.additional_context = "الملاحظات الإضافية طويلة جداً (الحد الأقصى 2000 حرف).";
    } else {
      sanitized.additional_context = trimmedContext;
    }
  } else {
    sanitized.additional_context = null;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: sanitized,
  };
}

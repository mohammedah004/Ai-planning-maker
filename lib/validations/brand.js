import {
  PRODUCT_CATEGORIES,
  BRAND_TONES,
} from "./plan.js";

export { PRODUCT_CATEGORIES, BRAND_TONES };

/**
 * Validates and sanitizes brand profile form data with Arabic error messages.
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitizedData: Object }}
 */
export function validateBrandInput(data) {
  const errors = {};
  const sanitized = {};

  // 1. Profile / Brand Nickname (Required, 2-100 chars)
  if (!data?.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.name = "يرجى كتابة اسم تعريفي لملف البراند (مثال: براند القهوة الأساسي).";
  } else {
    const trimmed = data.name.trim();
    if (trimmed.length < 2) {
      errors.name = "اسم الملف التعريفي يجب أن يتكون من حرفين على الأقل.";
    } else if (trimmed.length > 100) {
      errors.name = "اسم الملف التعريفي طويل جداً (الحد الأقصى 100 حرف).";
    } else {
      sanitized.name = trimmed;
    }
  }

  // 2. Product Name (Required, 2-120 chars)
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

  // 3. Product Description (Required, 10-2000 chars)
  if (!data?.product_description || typeof data.product_description !== "string" || !data.product_description.trim()) {
    errors.product_description = "يرجى كتابة وصف تفصيلي للمنتج أو البراند.";
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

  // 4. Product Category (Required, must be in enum list)
  if (!data?.product_category || !PRODUCT_CATEGORIES.includes(data.product_category)) {
    errors.product_category = "يرجى اختيار تصنيف صالح للبراند.";
  } else {
    sanitized.product_category = data.product_category;
  }

  // 5. Target Audience (Required, 5-1000 chars)
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

  // 6. Problem It Solves (Required, 5-1000 chars)
  if (!data?.problem_solved || typeof data.problem_solved !== "string" || !data.problem_solved.trim()) {
    errors.problem_solved = "يرجى شرح المشكلة أو القيمة التي يقدمها البراند.";
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

  // 8. Website / Product URL (Optional, max 500 chars)
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

  // 10. is_default (Boolean)
  sanitized.is_default = Boolean(data?.is_default);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: sanitized,
  };
}

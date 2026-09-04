/**
 * Portable AI Context Generator (Blockers B06, B09)
 *
 * Formats clean, structured markdown contexts for exporting to external AI models
 * (ChatGPT, Claude, Gemini, etc.) and specifies strict return contracts with ```madar-changes fences.
 */

/**
 * Generates portable context for a single-day edit prompt.
 *
 * @param {Object} params
 * @param {Object} params.plan - Plan metadata and strategy
 * @param {Object} params.item - Target content item
 * @param {string} [params.customInstructions]
 * @returns {string} Markdown prompt string
 */
export function generateSingleDayPortableContext({
  plan,
  item,
  customInstructions = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const designCopy = item.designCopy || item.design_copy || {};

  return `### السياق الاستراتيجي لخطة التسويق (MADAR)
- البراند/المنتج: ${plan?.productName || plan?.product_name || "غير محدد"}
- تصنيف المنتج: ${plan?.productCategory || plan?.product_category || "غير محدد"}
- الجمهور المستهدف: ${plan?.targetAudience || plan?.target_audience || "غير محدد"}
- المشكلة المحلولة: ${plan?.problemSolved || plan?.problem_solved || "غير محدد"}
- نبرة الصوت: ${(plan?.brandTone || plan?.brand_tone || []).join(", ")}
- تموضع البراند: ${plan?.strategy?.positioning || "غير محدد"}
- زوايا الخطاب: ${(plan?.strategy?.messaging_angles || []).join(" | ")}

---

### المنشور الحالي لليوم (${dayNumber}):
- نوع القالب: ${item.postType || item.post_type}
- الهدف التسويقي: ${item.contentObjective || item.content_objective}
- الركيزة: ${item.contentPillar || item.content_pillar}
- الكابشن الحالي:
${item.caption || "لا يوجد كابشن"}
- تصميم البوست:
  * العنوان: ${designCopy.headline || ""}
  * النص الفرعي: ${designCopy.subtext || ""}
  * زر التصميم: ${designCopy.cta || ""}
- التوجيه البصري: ${item.designReference || item.design_reference || ""}
- الدعوة للإجراء (CTA): ${item.cta || ""}

---

### المطلوب:
${customInstructions || "قم بتحسين وصياغة المنشور بأسلوب احترافي يحقق أقصى تفاعل وتحويل."}

---

### صيغة الرد الإلزامية (Return Contract):
أعد الرد داخل وسم برمجية محدد كالتالي حصراً:
\`\`\`madar-changes
{
  "mode": "single_day",
  "day": ${dayNumber},
  "summary": "ملخص مختصر جداً للتعديل باللغة العربية",
  "changes": {
    "caption": "الكابشن الجديد المعدل",
    "design_copy": {
      "headline": "العنوان الجديد في التصميم",
      "subtext": "النص الفرعي الجديد",
      "cta": "زر الإجراء الجديد"
    },
    "post_type": "${item.postType || item.post_type}",
    "content_objective": "${item.contentObjective || item.content_objective}",
    "content_pillar": "${item.contentPillar || item.content_pillar}",
    "design_reference": "التوجيه البصري الجديد",
    "cta": "الدعوة للإجراء الجديدة"
  }
}
\`\`\`
ملاحظة: يمكنك تعديل الحقول التي ترغب بتغييرها فقط داخل changes وحذف الحقول التي لا ترغب بتعديلها.`;
}

/**
 * Generates portable context for full 30-day plan export.
 *
 * @param {Object} params
 * @param {Object} params.plan - Plan metadata and strategy
 * @param {Array<Object>} params.contentItems - All 30 content items
 * @param {string} [params.customInstructions]
 * @returns {string} Markdown prompt string
 */
export function generateMultiDayPortableContext({
  plan,
  contentItems = [],
  customInstructions = "",
}) {
  const itemsList = contentItems
    .map((item) => {
      const day = item.dayNumber || item.day_number;
      const dc = item.designCopy || item.design_copy || {};
      return `#### اليوم ${day}:
- القالب: ${item.postType || item.post_type} | الهدف: ${item.contentObjective || item.content_objective} | الركيزة: ${item.contentPillar || item.content_pillar}
- العنوان: ${dc.headline || ""}
- الكابشن: ${item.caption || ""}`;
    })
    .join("\n\n");

  return `### السياق الكامل لخطة الـ 30 يوماً (MADAR)
- البراند: ${plan?.productName || plan?.product_name || "غير محدد"}
- تصنيف المنتج: ${plan?.productCategory || plan?.product_category || "غير محدد"}
- الجمهور المستهدف: ${plan?.targetAudience || plan?.target_audience || "غير محدد"}
- المشكلة: ${plan?.problemSolved || plan?.problem_solved || "غير محدد"}
- نبرة الصوت: ${(plan?.brandTone || plan?.brand_tone || []).join(", ")}
- تموضع البراند: ${plan?.strategy?.positioning || "غير محدد"}

---

### قائمة المنشورات الحالية:
${itemsList}

---

### المطلوب:
${customInstructions || "راجع الخطة واقترح تعديلات على الأيام التي تحتاج تقوية وتحسين."}

---

### صيغة الرد الإلزامية (Return Contract):
\`\`\`madar-changes
{
  "mode": "multi_day",
  "summary": "ملخص التعديلات الشاملة على الأيام المختارة",
  "days": [
    {
      "day": 1,
      "changes": {
        "caption": "الكابشن المقترح الجديد",
        "design_copy": {
          "headline": "العنوان الجديد"
        }
      }
    }
  ]
}
\`\`\`
ملاحظة: ضمن مصفوفة days، ضع فقط الأيام التي تم تعديلها فعلياً، واذكر الحقول المعدلة فقط.`;
}

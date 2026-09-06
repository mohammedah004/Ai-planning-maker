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
    "post_type": "${item.postType || item.post_type}",
    "design_copy": ${(item.postType || item.post_type) === "reel" ? `{
      "hook_line": "الخطاف البصري لجذب الانتباه في أول 3 ثوانٍ",
      "total_duration_sec": 30,
      "scenes": [
        {
          "order": 1,
          "duration_sec": 5,
          "action_type": "camera_speech",
          "visual_direction": "لقطة قريبة للمتحدث مع نظرة مباشرة للكاميرا وحركة يد واثقة",
          "on_screen_text": "عنوان الخطاف الرئيسي بخط عريض",
          "voiceover": "الحديث المنطوق في بداية الفيديو"
        },
        {
          "order": 2,
          "duration_sec": 15,
          "action_type": "b_roll",
          "visual_direction": "لقطات سريعة توضح استعراض المشكلة وحلها مع مؤثرات صوتية",
          "on_screen_text": "3 خطوات عملية",
          "voiceover": "شرح النقاط والخطوات لحل المشكلة"
        },
        {
          "order": 3,
          "duration_sec": 10,
          "action_type": "on_screen_text",
          "visual_direction": "شاشة ختامية واضحة مع إشارة نحو الرابط في البايو",
          "on_screen_text": "احصل على نسختك الآن من الرابط في البايو",
          "voiceover": "إذا كنت ترغب بالبدء، اضغط على الرابط في البايو"
        }
      ]
    }` : (item.postType || item.post_type) === "carousel" ? `{
      "headline": "عنوان الغلاف للكاروسيل",
      "slides": [
        { "order": 1, "headline": "المقدمة والمدخل", "subtext": "تفاصيل الفكرة الأولى", "visual_note": "تصميم بخط عريض", "slide_cta": "اسحب لليسار ←" },
        { "order": 2, "headline": "الحل والخطوات", "subtext": "تفاصيل التطبيق والمميزات", "visual_note": "مخطط توضيحي", "slide_cta": "تابع للخطوة التالية ←" }
      ]
    }` : `{
      "headline": "العنوان الجديد في التصميم",
      "subtext": "النص الفرعي الجديد",
      "cta": "زر الإجراء الجديد"
    }`},
    "content_objective": "${item.contentObjective || item.content_objective}",
    "content_pillar": "${item.contentPillar || item.content_pillar}",
    "design_reference": "التوجيه البصري الجديد",
    "cta": "الدعوة للإجراء الجديدة"
  }
}
\`\`\`
ملاحظة: يمكنك تعديل الحقول التي ترغب بتغييرها فقط داخل changes وحذف الحقول التي لا ترغب بتعديلها.

### قواعد بنية تصميم المنشور (design_copy) حسب نوع القالب:
1. **قالب الريلز ("reel"):**
   - يتطلب مصفوفة "scenes" تحتوي على مشهدين على الأقل.
   - حقول كل مشهد حصراً:
     * "order": رقم المشهد المتسلسل (يبدأ من 1 تصاعدياً).
     * "duration_sec": مدة المشهد بالثواني (1 إلى 120).
     * "action_type": أحد الخيارات الثلاثة حصراً: "camera_speech" (متحدث للكاميرا) أو "on_screen_text" (نص على الشاشة) أو "b_roll" (لقطات استعراضية).
     * "visual_direction": وصف المشهد وزوايا الكاميرا.
     * "on_screen_text": النص المكتوب الظاهر على الشاشة.
     * "voiceover": النص الصوتي المنطوق.
   - يمنع تضمين "slides" في الريلز.

2. **قالب الكاروسيل ("carousel"):**
   - يتطلب مصفوفة "slides" تحتوي على شريحتين على الأقل (order, headline, subtext, visual_note, slide_cta).
   - يمنع تضمين "scenes" في الكاروسيل.

3. **قالب البوست الثابت والستوري ("static_post" أو "story"):**
   - يحتوي فقط على { "headline", "subtext", "cta" }.
   - يمنع تضمين "slides" أو "scenes".

### قواعد صارمة لحقل نوع القالب (post_type Contract):
- إذا قمت بتعديل حقل "post_type"، فيجب أن تكون القيمة واحدة فقط من القيم القانونية التالية حصراً:
  * "reel" (فيديو ريلز)
  * "carousel" (منشور متعدد / شرائح / كاروسيل)
  * "static_post" (منشور فردي ثابت / صورة فردية)
  * "story" (قصة / ستوري)
- القيم مثل ("post", "slides", "video", "منشور", "ثريد") ليست قيماً قانونية في النظام وسيتم رفضها فوراً.
- عند تحويل نوع القالب إلى "reel"، يجب دائماً تضمين مصفوفة "scenes" بالبنية الموضحة أعلاه.

### قواعد حماية العقد والسياق (Contract & Scope Integrity):
- وضع التعديل (mode) يجب أن يكون دائماً "single_day"، ورقم اليوم (day) يجب أن يكون دائماً ${dayNumber}.
- الحقول المسموحة حصراً داخل changes هي: ("caption", "design_copy", "post_type", "content_objective", "content_pillar", "design_reference", "cta").
- ممنوع نهائياً إضافة أي حقول مجهولة أو خارجية (مثل: "priority", "platform", "admin", "audience_age", "status", "error"). وجود أي حقل غير مصرح به سيؤدي لرفض التعديل بالكامل.
- في حال كان طلب المستخدم غير صالح أو خارج نطاق البراند أو يطلب منصات غير معتمدة، يُمنع الرد بنصوص اعتذارية خارج كود madar-changes؛ يجب دائماً إرجاع كود madar-changes يحتوي على تحسين احترافي للمنشور الحالي يناسب البراند مع توضيح ذلك في summary.`;
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
ملاحظة: ضمن مصفوفة days، ضع فقط الأيام التي تم تعديلها فعلياً، واذكر الحقول المعدلة فقط.

### قواعد بنية تصميم المنشور (design_copy) حسب نوع القالب:
1. **قالب الريلز ("reel"):**
   - يتطلب مصفوفة "scenes" تحتوي على مشهدين على الأقل (order, duration_sec, action_type, visual_direction, on_screen_text, voiceover).
   - "action_type" يكون حصراً: "camera_speech" أو "on_screen_text" أو "b_roll".
   - يمنع تضمين "slides" في الريلز.

2. **قالب الكاروسيل ("carousel"):**
   - يتطلب مصفوفة "slides" تحتوي على شريحتين على الأقل (order, headline, subtext, visual_note, slide_cta).
   - يمنع تضمين "scenes" في الكاروسيل.

3. **قالب البوست الثابت والستوري ("static_post" أو "story"):**
   - يحتوي فقط على { "headline", "subtext", "cta" } دون شرائح أو مشاهد.

### قواعد صارمة لحقل نوع القالب (post_type Contract):
- إذا قمت بتعديل حقل "post_type" لأي يوم، فيجب أن تكون القيمة واحدة فقط من القيم القانونية التالية حصراً:
  * "reel" (فيديو ريلز)
  * "carousel" (منشور متعدد / شرائح / كاروسيل)
  * "static_post" (منشور فردي ثابت / صورة فردية)
  * "story" (قصة / ستوري)
- القيم مثل ("post", "slides", "video", "منشور", "ثريد") ليست قيماً قانونية في النظام وسيتم رفضها فوراً.
- عند تحويل أي يوم إلى "reel"، يجب تضمين مصفوفة "scenes" بالبنية المعتمدة.

### قواعد حماية العقد والسياق (Contract & Scope Integrity):
- وضع التعديل (mode) يجب أن يكون دائماً "multi_day"، ومصفوفة days يجب أن تحتوي على أرقام الأيام الحقيقية المراد تعديلها فقط دون تكرار.
- الحقول المسموحة حصراً داخل changes لكل يوم هي: ("caption", "design_copy", "post_type", "content_objective", "content_pillar", "design_reference", "cta").
- ممنوع نهائياً إضافة أي حقول مجهولة أو خارجية (مثل: "priority", "platform", "admin", "audience_age", "status", "error").
- في حال كان طلب المستخدم غير صالح أو خارج نطاق البراند، يُمنع الرد بنصوص اعتذارية خارج كود madar-changes؛ يجب دائماً إرجاع كود madar-changes يحتوي على تعديل احترافي يتناسب مع هوية البراند.`;
}

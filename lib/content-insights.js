/**
 * Content Mix Intelligence & Strategic Explanation Engine
 * 100% Deterministic JavaScript - ZERO AI Calls, ZERO Latency.
 */

export const OBJECTIVE_METADATA = {
  awareness: {
    label: "توعية وجذب (Awareness)",
    shortLabel: "توعية",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgLight: "bg-blue-500/10",
    description: "جذب أنظار الجمهور الجديد وتعريفهم بالمشكلة والبراند.",
  },
  education: {
    label: "تعليم وقيمة (Education)",
    shortLabel: "تعليم",
    color: "bg-indigo-500",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    bgLight: "bg-indigo-500/10",
    description: "تقديم نصائح وإرشادات تبني سلطة معرفية للبراند.",
  },
  engagement: {
    label: "تفاعل ومجتمع (Engagement)",
    shortLabel: "تفاعل",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgLight: "bg-purple-500/10",
    description: "تحفيز التعليقات والمشاركات وحفظ المنشورات.",
  },
  trust: {
    label: "بناء ثقة ومصداقية (Trust)",
    shortLabel: "ثقة ومصداقية",
    color: "bg-teal-500",
    textColor: "text-teal-400",
    borderColor: "border-teal-500/30",
    bgLight: "bg-teal-500/10",
    description: "كشف كواليس العمل، الجودة، وقيم البراند الصادقة.",
  },
  social_proof: {
    label: "إثبات اجتماعي (Social Proof)",
    shortLabel: "إثبات اجتماعي",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgLight: "bg-emerald-500/10",
    description: "شهادات العملاء وتجارب الاستخدام الفعلية لطمأنة المترددين.",
  },
  objection_handling: {
    label: "تفنيد الاعتراضات (Objection Handling)",
    shortLabel: "تفنيد الاعتراضات",
    color: "bg-amber-500",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgLight: "bg-amber-500/10",
    description: "الإجابة على التساؤلات والشكوك التي تمنع الشراء.",
  },
  conversion: {
    label: "تحويل ومبيعات مباشرة (Conversion)",
    shortLabel: "مبيعات وتحويل",
    color: "bg-rose-500",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgLight: "bg-rose-500/10",
    description: "عروض مباشرة ودعوة صريحة لطلب المنتج والشراء.",
  },
};

export const FORMAT_METADATA = {
  reel: {
    label: "ريلز (Reels)",
    shortLabel: "ريلز",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    description: "أعلى وصول خوارزمي لجلب متابعين جدد وتوصيل المشاعر السريعة.",
  },
  carousel: {
    label: "كاروسيل (Carousels)",
    shortLabel: "كاروسيل",
    color: "bg-indigo-500",
    textColor: "text-indigo-400",
    description: "الأفضل لزيادة معدل الحفظ (Save) وتقديم قيمة تعليمية دسمة.",
  },
  static_post: {
    label: "منشورات ثابتة (Static Posts)",
    shortLabel: "منشور ثابت",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    description: "تثبيت الهوية البصرية ونقل الاقتباسات أو العروض الواضحة.",
  },
  story: {
    label: "ستوري (Stories)",
    shortLabel: "ستوري",
    color: "bg-amber-500",
    textColor: "text-amber-400",
    description: "تواصل يومي مباشر، استطلاعات رأي، وعروض ذات طابع استعجالي.",
  },
};

/**
 * Aggregates objective distribution from content items.
 */
export function calculateObjectiveMix(contentItems = []) {
  const total = contentItems.length || 1;
  const counts = {};

  Object.keys(OBJECTIVE_METADATA).forEach((key) => {
    counts[key] = 0;
  });

  contentItems.forEach((item) => {
    const key = (item.contentObjective || item.content_objective || "awareness").toLowerCase();
    if (counts[key] !== undefined) {
      counts[key] += 1;
    } else {
      counts.awareness = (counts.awareness || 0) + 1;
    }
  });

  return Object.entries(counts).map(([key, count]) => {
    const meta = OBJECTIVE_METADATA[key] || OBJECTIVE_METADATA.awareness;
    const percentage = Math.round((count / total) * 100);
    return {
      key,
      count,
      percentage,
      ...meta,
    };
  });
}

/**
 * Aggregates format distribution from content items.
 */
export function calculateFormatMix(contentItems = []) {
  const total = contentItems.length || 1;
  const counts = { reel: 0, carousel: 0, static_post: 0, story: 0 };

  contentItems.forEach((item) => {
    const key = (item.postType || item.post_type || "reel").toLowerCase();
    if (counts[key] !== undefined) {
      counts[key] += 1;
    } else if (key.includes("reel")) {
      counts.reel += 1;
    } else if (key.includes("carousel")) {
      counts.carousel += 1;
    } else if (key.includes("story")) {
      counts.story += 1;
    } else {
      counts.static_post += 1;
    }
  });

  return Object.entries(counts).map(([key, count]) => {
    const meta = FORMAT_METADATA[key] || FORMAT_METADATA.static_post;
    const percentage = Math.round((count / total) * 100);
    return {
      key,
      count,
      percentage,
      ...meta,
    };
  });
}

/**
 * Produces 2-4 rule-based strategic summary insights.
 */
export function generateStrategicInsights(contentItems = [], objectiveMix = [], formatMix = []) {
  const insights = [];

  const totalPosts = contentItems.length;
  if (totalPosts === 0) return insights;

  const conversionItem = objectiveMix.find((o) => o.key === "conversion");
  const educationItem = objectiveMix.find((o) => o.key === "education");
  const awarenessItem = objectiveMix.find((o) => o.key === "awareness");
  const trustItems = objectiveMix.filter((o) => o.key === "trust" || o.key === "social_proof");
  const combinedTrustPct = trustItems.reduce((acc, cur) => acc + cur.percentage, 0);

  const reelItem = formatMix.find((f) => f.key === "reel");
  const carouselItem = formatMix.find((f) => f.key === "carousel");

  // Insight 1: Sales & Conversion Balance
  if (conversionItem && conversionItem.percentage < 12) {
    insights.push({
      type: "tip",
      title: "توازن مدروس في المبيعات المباشرة",
      badge: `${conversionItem.percentage}% منشورات تحويل`,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description:
        "تم التركيز على بناء الرغبة والقيمة أولاً وتخصيص نسبة معتدلة للبيع المباشر حتى لا يبدو الحساب تجارياً بحتاً، مما يعزز ولاء المتابعين ويزيد معدل إغلاق الصفقات.",
    });
  } else if (conversionItem && conversionItem.percentage >= 20) {
    insights.push({
      type: "highlight",
      title: "خطة قوية ذات تركيز بيعي مباشر",
      badge: `${conversionItem.percentage}% دعوات للشراء`,
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      description:
        "تحتوي الخطة على زخم بيعي ملحوظ ومناسب لحملات الإطلاق أو مواسم العروض، مع الاعتماد على تكرار رسائل الشراء بزوايا إقناع مختلفة لتسريع اتخاذ القرار.",
    });
  }

  // Insight 2: Format Strategy (Reach vs Retain)
  if (reelItem && reelItem.percentage >= 30) {
    insights.push({
      type: "growth",
      title: "محرك نمو سريع عبر الريلز (Reels)",
      badge: `${reelItem.percentage}% محتوى فيديو`,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description:
        "الاعتماد الكثيف على الريلز يعطي الأولوية لاختراق خوارزمية إنستغرام وجلب تدفق مستمر من المتابعين والمهتمين الجدد من خارج قائمة متابعيك الحالية.",
    });
  } else if (carouselItem && carouselItem.percentage >= 30) {
    insights.push({
      type: "retention",
      title: "تركيز عميق على معدلات الحفظ والمشاركة",
      badge: `${carouselItem.percentage}% كاروسيل تفاعلي`,
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      description:
        "توزيع الكاروسيل المكثف يمنح حسابك ميزة الحفظ المتكرر (Saves) الذي يُصنف خوارزمياً كأعلى مؤشر لجودة المحتوى وفائدته للجمهور.",
    });
  }

  // Insight 3: Social Proof & Trust Architecture
  if (combinedTrustPct >= 20) {
    insights.push({
      type: "trust",
      title: "هندسة الثقة والإثبات الاجتماعي",
      badge: `${combinedTrustPct}% ثقة وتجارب`,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description:
        "تم تخصيص خُمس الخطة للتأكيد على مصداقية البراند وشهادات العملاء وكواليس الجودة، وهو ما يزيل التردد النفسي لدى المشتري قبل الدفع.",
    });
  } else {
    insights.push({
      type: "general",
      title: "قمع تسويقي متدرج ومتكامل (Full Funnel)",
      badge: "تدرج 30 يوماً",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description:
        "يتدرج تقويم الشهر من جذب الانتباه في الأسبوع الأول، إلى توضيح القيمة والميزات في الأسبوع الثاني، ثم معالجة الاعتراضات وتحفيز القرار في الأسبوعين الأخيرين.",
    });
  }

  return insights;
}

/**
 * Returns a structured strategic justification for an individual post.
 * 100% deterministic logic based on post format, objective, and plan context.
 */
export function getWhyThisPostExplanation(post = {}, strategy = {}) {
  const objective = (post.contentObjective || post.content_objective || "awareness").toLowerCase();
  const format = (post.postType || post.post_type || "reel").toLowerCase();

  // 1. Objective Purpose
  let objectivePurpose = "";
  switch (objective) {
    case "awareness":
      objectivePurpose = "جذب انتباه شريحة جديدة وتذكيرهم بالمشكلة الأساسية بأسلوب سريع وخطاف.";
      break;
    case "education":
      objectivePurpose = "بناء مكانة البراند كمرجع موثوق عبر تقديم حلول وقيمة عملية ملموسة للعميل.";
      break;
    case "engagement":
      objectivePurpose = "تحفيز الخوارزمية عبر التعليقات والمشاركات لبناء رابطة شخصية ومجتمع متفاعل.";
      break;
    case "trust":
      objectivePurpose = "كشف جوانب الشفافية والكفاءة في تقديم المنتج لتأسيس الثقة والاطمئنان.";
      break;
    case "social_proof":
      objectivePurpose = "إزالة المخاوف النفسية من خلال استعراض النتائج الحقيقية وتجارب الآخرين الناجحة.";
      break;
    case "objection_handling":
      objectivePurpose = "الإجابة الاستباقية على التردد (مثل السعر، الصعوبة، أو الوقت) قبل أن يتحول لسبب للرفض.";
      break;
    case "conversion":
      objectivePurpose = "توجيه نداء مباشر ومغري لإتمام الطلب أو الشراء فوراً واستغلال الرغبة المتراكمة.";
      break;
    default:
      objectivePurpose = "تعزيز الوعي بالبراند وترسيخ التموضع في ذهن العميل المستهدف.";
  }

  // 2. Format Fit Justification
  let formatFit = "";
  if (format.includes("reel")) {
    formatFit = "تم اختيار قالب الريلز (Reel) لأن هذا المحتوى يعتمد على السرد المرئي السريع والجاذبية العاطفية، وهو القالب الأفضل لاختراق صفحة Explore والوصول لعملاء جدد.";
  } else if (format.includes("carousel")) {
    formatFit = "تم اختيار الكاروسيل متعدد الشرائح لتقسيم الفكرة إلى خطوات متسلسلة وسهلة الهضم، مما يحفز العميل على التمرير وحفظ المنشور للرجوع إليه لاحقاً.";
  } else if (format.includes("static")) {
    formatFit = "تم اختيار المنشور الثابت (Static Post) لتقديم رسالة بصرية مباشرة وموجزة دون تشتيت، مما يساعد على تثبيت هوية البراند وتصميم الإعلان بوضوح تام.";
  } else if (format.includes("story")) {
    formatFit = "تم اختيار الستوري لخلق شعور بالقرب والعفوية والمحادثة المباشرة مع المتابع، مع إمكانية توفير روابط مباشرة للاستجابة السريعة.";
  } else {
    formatFit = "تم اختيار هذا القالب ليتناسب مع وتيرة تقويم المحتوى ويمنح الحساب تنوعاً جذاباً يمنع الملل.";
  }

  // 3. Audience & Psychological Angle
  const audience = strategy?.target_audience_analysis
    ? strategy.target_audience_analysis.slice(0, 140) + "..."
    : "الجمهور المستهدف الباحث عن حلول عملية وموثوقة لمنتجك.";

  return {
    objectiveLabel: OBJECTIVE_METADATA[objective]?.label || objective,
    objectivePurpose,
    formatFit,
    audienceContext: audience,
  };
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Zap,
  Target,
  Share2,
  Sparkles,
  Building2,
  Check,
  Clock,
  Copy,
  Shield,
  Star,
  Play,
  Menu,
  X,
  Flame,
} from "lucide-react";
import ThemeToggle from "@/app/components/shell/ThemeToggle";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Interactive Mock Plan Data for the Hero Window
const MOCK_DAYS = [
  {
    day: 1,
    type: "ريلز (Reel Script)",
    typeBadge: "reels",
    objective: "زيادة الوعي وبناء الفضول (Awareness)",
    hook: "«إذا كنت لا تزال تدير محتواك يدوياً في 2026، فإليك 3 أشياء تسرق وقتك دون أن تدري...»",
    caption:
      "معظم أصحاب المشاريع يعانون من الانقطاع عن النشر ليس بسبب قلة الأفكار، بل بسبب غياب الاستراتيجية المؤطرة مسبقاً. احفظ هذا المنشور وابدأ بتطبيق المعادلة الثلاثية المنظمة لنشر 30 يوماً بدون توتر.",
    designCopy:
      "الشريحة الأولى: عنوان بارز بلون أبيض على خلفية داكنة مع حركة سريعة. كتابة ثلاث نقاط سريعة تظهر بالتزامن مع الإيقاع الصوتي.",
    visualNotes:
      "تصوير بكاميرا هاتف عمودية (9:16)، إضاءة ناعمة من الجانب الأيسر، قطع سريع كل 2.5 ثانية للحفاظ على معدل الاحتفاظ بالجمهور (Retention Rate).",
    time: "7:30 مساءً",
    tags: ["#تسويق_إلكتروني", "#صناعة_المحتوى", "#ريلز_إنستغرام", "#رواد_أعمال"],
  },
  {
    day: 2,
    type: "كاروسيل تعليمي (Carousel)",
    typeBadge: "carousel",
    objective: "التعليم والإثبات الاجتماعي (Authority)",
    hook: "دليل عملي من 5 شرائح: كيف تبني تموضعاً لعلامتك التجارية يجعلك الخيار الوحيد لعميلك؟",
    caption:
      "التموضع ليس مجرد شعار أو ألوان؛ إنه الصورة الذهنية التي تستقر في عقل المشتري عند سماع اسم منتجك. مرّر الشرائح لتتعرف على الخطوات الخمس الدقيقة التي نطبقها في كل استراتيجية محتوى ناجحة.",
    designCopy:
      "شريحة 1: عنوان قوي مع أيقونة بوصلة. شرائح 2-4: رسم توضيحي بياني لكل خطوة مع نص لا يتجاوز 25 كلمة لكل شريحة. شريحة 5: دعوة للتفاعل والمشاركة.",
    visualNotes:
      "تصميم بأسلوب المينيماليزم (Minimalist) متناسق مع هوية البراند، مقاس 4:5 مع مساحات بيضاء كافية لراحة العين أثناء التصفح.",
    time: "6:00 مساءً",
    tags: ["#هوية_بصرية", "#استراتيجية_تسويق", "#كاروسيل_تعليمي", "#بناء_البراند"],
  },
  {
    day: 3,
    type: "ستوري تفاعلي (Story Sequence)",
    typeBadge: "story",
    objective: "المشاركة والتحويل المباشر (Sales & Direct Conversion)",
    hook: "«سؤال سريع لرواد الأعمال: ما هو أكبر تحدٍ يواجهك هذا الشهر في إدارة حسابك؟»",
    caption:
      "تسلسل ستوري ثلاثي يبدأ باستطلاع تفاعلي (Poll)، يليه كواليس سريعة من تجارب العملاء السابقة، وينتهي برابط حجز العرض الخاص مع كود خصم محدود.",
    designCopy:
      "ستوري 1: ملصق تصويت واضح وسهل. ستوري 2: لقطة شاشة لتقييم عميل حقيقي. ستوري 3: رابط زر مباشر بلون مميز وعبارة 'اكتشف المزيد'.",
    visualNotes:
      "فيديو عفوي بطابع كواليس حقيقية بدون تكلف مع ملصقات إنستغرام التفاعلية لرفع معدل المشاركة بنسبة 40%.",
    time: "1:00 ظهراً",
    tags: ["#ستوري_تفاعلي", "#كواليس_العمل", "#عروض_خاصة"],
  },
];

export default function LandingPageClient({ user = null }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedDay, setCopiedDay] = useState(false);

  const activeDay = MOCK_DAYS[activeDayIdx];

  const handleCopySnippet = () => {
    if (typeof window === "undefined") return;
    const text = `${activeDay.hook}\n\n${activeDay.caption}`;
    navigator.clipboard.writeText(text);
    setCopiedDay(true);
    setTimeout(() => setCopiedDay(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-[#1A1D1F] dark:text-zinc-100 selection:bg-blue-100 selection:text-[#0B57D0] dark:selection:bg-blue-600 dark:selection:text-white transition-colors duration-200" dir="rtl">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-[#E4E7EC] dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Right: Brand Identity & Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0B57D0] to-blue-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1A1D1F] dark:text-zinc-100 leading-tight">
                  مخطط التسويق الذكي
                </span>
                <span className="text-[11px] font-medium text-[#575C61] dark:text-zinc-400 leading-none">
                  محرك إدارة المحتوى لـ 30 يوماً
                </span>
              </div>
            </Link>

            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B57D0] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">
              <Sparkles className="w-3 h-3 text-[#0B57D0] dark:text-blue-400" />
              خوارزميات التخطيط المتقدمة
            </span>
          </div>

          {/* Center: Smooth Scroll Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-[#575C61] dark:text-zinc-400">
            <a
              href="#features"
              className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors py-1"
            >
              المميزات
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors py-1"
            >
              كيف يعمل
            </a>
            <a
              href="#brand-memory"
              className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors py-1"
            >
              ذاكرة البراند
            </a>
            <a
              href="#interactive-demo"
              className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors py-1"
            >
              معاينة الخطة
            </a>
            <a
              href="#testimonials"
              className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors py-1"
            >
              آراء المستخدمين
            </a>
          </nav>

          {/* Left: ThemeToggle & CTAs */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 active:scale-[0.98]"
              >
                <span>لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-850 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 active:scale-[0.98]"
                >
                  <span>ابدأ مجاناً</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4E7EC] dark:border-zinc-800/80 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-lg px-4 py-5 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-bold text-[#575C61] dark:text-zinc-300 text-right">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0B57D0] dark:hover:text-blue-400"
              >
                المميزات
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0B57D0] dark:hover:text-blue-400"
              >
                كيف يعمل
              </a>
              <a
                href="#brand-memory"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0B57D0] dark:hover:text-blue-400"
              >
                ذاكرة البراند
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0B57D0] dark:hover:text-blue-400"
              >
                معاينة الخطة
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#0B57D0] dark:hover:text-blue-400"
              >
                آراء المستخدمين
              </a>
            </nav>

            {!user && (
              <div className="pt-3 border-t border-[#E4E7EC] dark:border-zinc-800 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-xl border border-[#E4E7EC] dark:border-zinc-800 text-xs font-bold text-[#1A1D1F] dark:text-zinc-200"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-xl bg-[#0B57D0] text-white text-xs font-bold shadow-md"
                >
                  ابدأ الآن مجاناً
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-[#0B57D0]/10 to-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Innovation Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8F9FB] dark:bg-zinc-900/90 border border-[#E4E7EC] dark:border-zinc-800 text-xs font-bold text-[#575C61] dark:text-zinc-300 mb-8 shadow-xs hover:border-[#0B57D0]/40 transition-colors select-none">
          <span className="flex h-2 w-2 rounded-full bg-[#0B57D0] animate-pulse" />
          <span>✨ الجيل الجديد من إدارة محتوى إنستغرام الذكي</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-[#1A1D1F] dark:text-[#F8F9FA] leading-[1.3] sm:leading-[1.18] max-w-5xl mx-auto">
          أدخل وصف منتجك.. واستلم <br className="hidden sm:inline" />
          <span className="bg-gradient-to-l from-[#0B57D0] via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
            خطة إنستغرام كاملة لـ 30 يوماً
          </span>
          <br />
          مجهزة للتنفيذ والإخراج الفوري.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-7 text-base sm:text-lg lg:text-xl text-[#575C61] dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          محرك التخطيط الاستراتيجي الذكي يحلل تموضع علامتك ونفسية المشتري، ويولد تقويماً شهرياً دقيقاً يشمل الكابشن، نصوص تصاميم الجرافيك (Design Copy)، وتوجيه الإخراج مع تصدير مباشر إلى جداول Google Sheets بنقرة واحدة.
        </p>

        {/* Dual CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            href={user ? "/plans/new" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/45 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white/90" />
            <span>أنشئ خطة الـ 30 يوماً الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <a
            href="#interactive-demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#F8F9FB] hover:bg-[#F0F4F8] border border-[#E4E7EC] text-[#1A1D1F] dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-200 font-bold text-sm sm:text-base transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#0B57D0] dark:text-blue-400" />
            <span>معاينة نموذج الخطة المكتملة</span>
          </a>
        </div>

        {/* 4 Feature Badges */}
        <div className="mt-14 pt-10 border-t border-[#E4E7EC] dark:border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs text-[#575C61] dark:text-zinc-300 font-semibold max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/60 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-blue-400 shrink-0" />
            <span>30 منشوراً استراتيجياً</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/60 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-blue-400 shrink-0" />
            <span>نصوص تصاميم الجرافيك</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/60 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-blue-400 shrink-0" />
            <span>توجيه بصري وإخراجي</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/60 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-blue-400 shrink-0" />
            <span>تصدير مباشر لـ Google Sheets</span>
          </div>
        </div>

        {/* 3. Hero Interactive Preview Mockup Window */}
        <div id="interactive-demo" className="mt-16 text-right max-w-5xl mx-auto scroll-mt-24">
          <div className="rounded-3xl border border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-[#131316] shadow-2xl shadow-blue-950/10 dark:shadow-black/50 overflow-hidden">
            {/* Window Top Chrome */}
            <div className="px-5 py-3.5 bg-[#F8F9FB] dark:bg-zinc-900/90 border-b border-[#E4E7EC] dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="text-xs font-bold text-[#575C61] dark:text-zinc-400 mr-2">
                  استوديو استراتيجية المحتوى — تقويم الـ 30 يوماً
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  مكتمل وجاهز للتصدير
                </span>

                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B57D0] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>متوافق مع Google Sheets</span>
                </div>
              </div>
            </div>

            {/* Mock Header Info */}
            <div className="p-6 border-b border-[#E4E7EC] dark:border-zinc-800/80 bg-[#FAFAFC] dark:bg-[#101014] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-black text-[#1A1D1F] dark:text-zinc-100">
                    خطة: تطبيق ZenFlow للإنتاجية وتنظيم الوقت
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-[#0B57D0] dark:text-blue-300 text-[10px] font-bold">
                    برمجيات SaaS
                  </span>
                </div>
                <p className="text-xs text-[#575C61] dark:text-zinc-400">
                  الهدف الأساسي: <strong className="text-[#1A1D1F] dark:text-zinc-200">جلب عملاء وتنزيلات مباشرة</strong> • النبرة: <strong className="text-[#1A1D1F] dark:text-zinc-200">احترافي، تحفيزي، مباشر</strong>
                </p>
              </div>

              {/* Day Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-[#F0F4F8] dark:bg-zinc-900 p-1.5 rounded-2xl self-start md:self-auto overflow-x-auto max-w-full">
                {MOCK_DAYS.map((item, idx) => (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeDayIdx === idx
                        ? "bg-white dark:bg-zinc-800 text-[#0B57D0] dark:text-blue-400 shadow-sm"
                        : "text-[#575C61] dark:text-zinc-400 hover:text-[#1A1D1F] dark:hover:text-zinc-200"
                    }`}
                  >
                    اليوم {item.day}: {item.type.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Active Day Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Type and Objective Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC] dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#0B57D0] dark:text-blue-300 flex items-center justify-center font-black text-xs">
                    0{activeDay.day}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1D1F] dark:text-zinc-100">{activeDay.type}</h4>
                    <span className="text-[11px] text-[#575C61] dark:text-zinc-400">{activeDay.objective}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#575C61] dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0B57D0] dark:text-blue-400" />
                    <span>وقت النشر: {activeDay.time}</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8F9FB] hover:bg-[#F0F4F8] dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-[#E4E7EC] dark:border-zinc-800 text-[#1A1D1F] dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedDay ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDay ? "تم النسخ" : "نسخ النص"}</span>
                  </button>
                </div>
              </div>

              {/* Hook Card */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B57D0] dark:text-blue-400">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>الخطاف البصري والسمعي (Hook الأول في أول 3 ثوانٍ):</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#1A1D1F] dark:text-zinc-200 leading-relaxed">
                  {activeDay.hook}
                </p>
              </div>

              {/* Grid of Caption vs Design Copy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Caption Block */}
                <div className="p-5 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/40 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-2">
                  <div className="text-xs font-bold text-[#575C61] dark:text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B57D0] dark:text-blue-400" />
                    <span>الكابشن الاستراتيجي الكامل:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {activeDay.caption}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {activeDay.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-bold text-[#0B57D0] dark:text-blue-400 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded-md border border-[#E4E7EC] dark:border-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Graphic Copy & Direction */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/40 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-1.5">
                    <span className="block text-xs font-bold text-[#575C61] dark:text-zinc-400">
                      نصوص التصاميم الجرافيكية (Design Copy):
                    </span>
                    <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
                      {activeDay.designCopy}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                    <span className="block text-xs font-bold text-amber-800 dark:text-amber-400">
                      توجيهات الإخراج وزاوية الكاميرا:
                    </span>
                    <p className="text-xs text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
                      {activeDay.visualNotes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Proof / Impact Numbers (Stats Strip) */}
      <section className="py-12 bg-[#F8F9FB] dark:bg-zinc-900/40 border-y border-[#E4E7EC] dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
              <div className="text-2xl sm:text-4xl font-black text-[#0B57D0] dark:text-blue-400 tracking-tight">
                +30 يوماً
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1A1D1F] dark:text-zinc-200">
                خطة استراتيجية متكاملة
              </div>
              <div className="text-[11px] text-[#575C61] dark:text-zinc-400">
                جاهزة فوراً بنقرة واحدة
              </div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
              <div className="text-2xl sm:text-4xl font-black text-[#0B57D0] dark:text-blue-400 tracking-tight">
                100%
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1A1D1F] dark:text-zinc-200">
                متوافق مع خوارزميات إنستغرام
              </div>
              <div className="text-[11px] text-[#575C61] dark:text-zinc-400">
                ريلز، كاروسيل، واستوريات تفاعلية
              </div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
              <div className="text-2xl sm:text-4xl font-black text-[#0B57D0] dark:text-blue-400 tracking-tight">
                نقرة واحدة
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1A1D1F] dark:text-zinc-200">
                للتصدير إلى Google Sheets
              </div>
              <div className="text-[11px] text-[#575C61] dark:text-zinc-400">
                جدول منظم جاهز لفريق التنفيذ
              </div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
              <div className="text-2xl sm:text-4xl font-black text-[#0B57D0] dark:text-blue-400 tracking-tight">
                0 دقيقة
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1A1D1F] dark:text-zinc-200">
                وقت ضائع في الحيرة الإبداعية
              </div>
              <div className="text-[11px] text-[#575C61] dark:text-zinc-400">
                تفرغ لنمو مبيعاتك وأعمالك
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Capabilities (Interactive Grid) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-[#0B57D0] dark:text-blue-300 text-xs font-bold inline-block">
            القدرات الجوهرية
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1A1D1F] dark:text-zinc-100 tracking-tight">
            نظام استراتيجي متكامل لا يترك شيئاً للصدفة
          </h2>
          <p className="text-xs sm:text-base text-[#575C61] dark:text-zinc-400 leading-relaxed">
            لا نكتفي بتوليد جمل تسويقية عامة، بل نطبق منهجية إعلانية محكمة تبدأ من سيكولوجية المشتري وتصل إلى شيت الجدولة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-[#F8F9FB] hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4 hover:-translate-y-1 shadow-xs hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-600/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A1D1F] dark:text-zinc-100">
              1. تحليل الاستراتيجية والجمهور وتشخيص التموضع
            </h3>
            <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
              استخراج نقاط الألم الحقيقية للمشتري، صياغة زوايا الإقناع الفريدة، وتحليل مرحلة نضج المنتج بالسوق لتوجيه الخطاب بدقة تضمن كسب ثقة العميل.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-[#575C61] dark:text-zinc-300 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تحديد زوايا الإقناع (Angle Positioning) لكل مرحلة بيعية</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>صياغة هوكات تخاطب المخاوف والفوائد الجوهرية مباشرة</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-[#F8F9FB] hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4 hover:-translate-y-1 shadow-xs hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-600/10 dark:border-purple-500/20 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A1D1F] dark:text-zinc-100">
              2. تقويم 30 يوماً متكامل للتنفيذ (Content Engine)
            </h3>
            <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
              تقسيم مدروس على مدار الشهر بين التوعية، التعليم، الإثبات الاجتماعي، والبيع المباشر مع نصوص كاملة وتوجيهات لتصميم الصور والفيديوهات.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-[#575C61] dark:text-zinc-300 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>نصوص التصاميم الجرافيكية للبوستات والكاروسيل (Design Copy)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>سيناريو الريلز خطوة بخطوة مع توجيه الإضاءة وزوايا التصوير</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-[#F8F9FB] hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4 hover:-translate-y-1 shadow-xs hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-600/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A1D1F] dark:text-zinc-100">
              3. ذاكرة البراند الرقمية الذكية (Smart Brand Memory)
            </h3>
            <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
              احفظ هوية ونبرة علامتك التجارية وجمهورك المستهدف مرة واحدة. يولّد المحرك الخطط الشهرية القادمة بنفس الهوية دون الحاجة لإعادة كتابة البريف في كل مرة.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-[#575C61] dark:text-zinc-300 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تخزين ملفات متعددة لمختلف المنتجات والخدمات التي تديرها</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>توليد فوري للخطط اللاحقة بضغطة زر استناداً للذاكرة السابقة</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-[#F8F9FB] hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4 hover:-translate-y-1 shadow-xs hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-600/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A1D1F] dark:text-zinc-100">
              4. التصدير السحابي والتعاون مع العملاء (Sync & Share)
            </h3>
            <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
              تصدير سحابي فوري ومباشر إلى جداول Google Sheets مرتبة بأعمدة واضحة، مع روابط مشاركة عامة ومحمية تتيح للعملاء استعراض الخطة والموافقة عليها.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-[#575C61] dark:text-zinc-300 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>شيت Google مجهز بألوان منسقة وأعمدة جاهزة للمصمم وصانع الفيديو</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>روابط معاينة تفاعلية للعرض فقط بدون الحاجة لمنح صلاحيات التعديل</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. "How It Works" Section */}
      <section id="how-it-works" className="py-20 bg-[#F8F9FB] dark:bg-zinc-900/40 border-y border-[#E4E7EC] dark:border-zinc-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold inline-block">
              رحلة الاستخدام
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1A1D1F] dark:text-zinc-100 tracking-tight">
              3 خطوات بسيطة تفصلك عن خطتك الجاهزة
            </h2>
            <p className="text-xs sm:text-base text-[#575C61] dark:text-zinc-400 leading-relaxed">
              من الفكرة إلى جدول التنفيذ في أقل من دقيقتين.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-4 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-[#0B57D0] text-white flex items-center justify-center font-black text-sm shadow-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">
                أدخل تفاصيل نشاطك أو اختر براند محفوظ
              </h3>
              <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
                حدد اسم منتجك، المشكلة التي يحلها، الجمهور المستهدف، ونبرة الصوت. أو اختر براند من الذاكرة لتعبئة كل الحقول تلقائياً في جزء من الثانية.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-4 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">
                معالجة المحرك الاستراتيجي الذكي
              </h3>
              <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
                تقوم خوارزميات التخطيط المتقدمة بصياغة استراتيجية التموضع وتوزيع الـ 30 يوماً بدقة عبر محاور المحتوى، مع كتابة الكابشن ونصوص التصاميم والتوجيه البصري.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-4 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">
                التصدير المباشر لـ Google Sheets والنشر
              </h3>
              <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
                تصدير فوري بنقرة واحدة إلى جدول Google Sheets معتمد ومصنف، أو نسخ المنشورات مباشرة ومشاركتها مع فريق العمل أو العميل عبر رابط تفاعلي.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Smart Brand Memory Spotlight Section */}
      <section id="brand-memory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-blue-900/10 via-[#F8F9FB] to-blue-50/50 dark:from-blue-950/30 dark:via-zinc-900 dark:to-zinc-900 border border-blue-200 dark:border-zinc-800 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0B57D0] dark:text-blue-300 text-xs font-bold inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>ميزة حصرية للمحترفين</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-[#1A1D1F] dark:text-zinc-100 leading-tight">
                ذاكرة البراند الرقمية: <br />
                وداعاً لإعادة إدخال المعلومات في كل شهر.
              </h2>

              <p className="text-xs sm:text-base text-[#575C61] dark:text-zinc-300 leading-relaxed">
                أكبر مشكلة في أدوات التسويق هي فقدان السياق؛ في كل مرة تضطر لكتابة وصف نشاطك ونبرتك والجمهور من الصفر. في منصتنا، تحفظ ملف البراند لمرة واحدة، وكل خطة تالية تُبنى تلقائياً بالاعتماد على هوية البراند وتراكم الخبرة.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-100">
                    ✓ اتساق دائم في نبرة الصوت
                  </div>
                  <div className="text-[11px] text-[#575C61] dark:text-zinc-400">
                    لا تفاوت في الأسلوب بين أشهر التخطيط المختلفة.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-100">
                    ✓ سجل تراكمي للخطط السابقة
                  </div>
                  <div className="text-[11px] text-[#575C61] dark:text-zinc-400">
                    متابعة تطور الخطط المنشأة لكل عميل في شاشة واحدة.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 shadow-md space-y-4 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-zinc-800">
                  <span className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0B57D0]" />
                    <span>ملف البراند النشط</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    جاهز للاستيراد
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 space-y-0.5">
                    <span className="text-[10px] text-[#575C61] dark:text-zinc-500 font-bold">المنتج والنشاط:</span>
                    <p className="font-bold text-[#1A1D1F] dark:text-zinc-200">استوديو التصميم المعماري الحديث</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 space-y-0.5">
                    <span className="text-[10px] text-[#575C61] dark:text-zinc-500 font-bold">النبرة المختارة:</span>
                    <p className="font-bold text-[#1A1D1F] dark:text-zinc-200">فاخر (Luxury) • تعليمي ومبسط • ملهم ومحفز</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 space-y-0.5">
                    <span className="text-[10px] text-[#575C61] dark:text-zinc-500 font-bold">الجمهور المستهدف:</span>
                    <p className="font-bold text-[#1A1D1F] dark:text-zinc-200">ملاك الفلل وأصحاب العقارات الباحثين عن تصميم داخلي استثنائي</p>
                  </div>
                </div>

                <Link
                  href={user ? "/brands" : "/login"}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <span>استكشف ملفات البراند الخاصة بك</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="py-20 bg-[#F8F9FB] dark:bg-zinc-900/40 border-y border-[#E4E7EC] dark:border-zinc-800/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-[#0B57D0] dark:text-blue-300 text-xs font-bold inline-block">
              تجارب حقيقية
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1A1D1F] dark:text-zinc-100 tracking-tight">
              ماذا يقول صناع المحتوى والمسوقون؟
            </h2>
            <p className="text-xs sm:text-base text-[#575C61] dark:text-zinc-400">
              ساعدنا العشرات من وكالات التسويق وأصحاب المتاجر في التخلص من عبء التخطيط اليدوي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-4 shadow-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
                «كنا نقضي أسبوعين في كل شهر لإعداد خطة محتوى إنستغرام لـ 6 عملاء. مع المنصة، أصبحنا ننتج مسودة الخطة لـ 30 يوماً مع توجيه الإخراج وتصدير Google Sheet في جلسة واحدة!»
              </p>
              <div className="pt-2 border-t border-[#E4E7EC] dark:border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0B57D0] dark:bg-zinc-800 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                  ع.م
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-200">عبدالرحمن المطيري</div>
                  <div className="text-[11px] text-[#575C61] dark:text-zinc-400">مؤسس وكالة تسويق رقمي</div>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-4 shadow-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
                «أفضل ما في الأداة هو نصوص تصاميم الجرافيك وسيناريوهات الريلز. المصممون وفريق الفيديو في متجري أصبحوا يعرفون بدقة ما يجب تنفيذه دون الحاجة لاجتماعات طويلة.»
              </p>
              <div className="pt-2 border-t border-[#E4E7EC] dark:border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-zinc-800 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                  س.ح
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-200">سارة الحازمي</div>
                  <div className="text-[11px] text-[#575C61] dark:text-zinc-400">مالكة متجر أزياء إلكتروني</div>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-4 shadow-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
                «ميزة ذاكرة البراند خارقة. مجرد أن أختار براند العميل، كل الكابشن والهاشتاقات تخرج بنفس روح ونبرة البراند بالضبط بدون أي تشابه بين العملاء المختلفين.»
              </p>
              <div className="pt-2 border-t border-[#E4E7EC] dark:border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 dark:bg-zinc-800 dark:text-purple-400 font-bold flex items-center justify-center text-xs">
                  ف.ن
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-200">فيصل النمر</div>
                  <div className="text-[11px] text-[#575C61] dark:text-zinc-400">صانع محتوى واستشاري نمو</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final High-Converting CTA Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0B57D0] via-blue-600 to-indigo-600 p-8 sm:p-14 text-center text-white space-y-6 shadow-xl shadow-blue-600/25 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              جاهز لتوفير أكثر من 40 ساعة شهرياً في تخطيط محتوى إنستغرام؟
            </h2>
            <p className="text-xs sm:text-base text-blue-100 leading-relaxed">
              ابدأ الآن وأدخل وصف منتجك لتستلم استراتيجيتك وتقويم الـ 30 يوماً وتصدير Google Sheet بضغطة زر.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/plans/new" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white hover:bg-zinc-100 text-[#0B57D0] font-black text-sm sm:text-base transition-all shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0B57D0]" />
              <span>أنشئ أول خطة لك الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-700/50 hover:bg-blue-700/70 border border-white/20 text-white font-bold text-sm sm:text-base transition-colors"
            >
              <span>دخول لوحة التحكم</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>بدون تعقيد إعدادات</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>توليد سريع خلال 60-90 ثانية</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>تصدير فوري لجداول Google Sheets</span>
            </span>
          </div>
        </div>
      </section>

      {/* 10. Modern Minimalist Footer */}
      <footer className="py-12 border-t border-[#E4E7EC] dark:border-zinc-800/80 bg-white dark:bg-[#09090b] text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#0B57D0] flex items-center justify-center text-white font-black text-sm shadow-sm">
                AI
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-[#1A1D1F] dark:text-zinc-100">
                  مخطط التسويق الذكي
                </div>
                <div className="text-xs text-[#575C61] dark:text-zinc-400">
                  استراتيجية وتقويم محتوى إنستغرام لـ 30 يوماً
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#575C61] dark:text-zinc-400">
              <Link href="/dashboard" className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors">
                لوحة التحكم
              </Link>
              <Link href="/plans/new" className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors">
                إنشاء خطة جديدة
              </Link>
              <Link href="/brands" className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors">
                ذاكرة البراند
              </Link>
              <Link href="/settings" className="hover:text-[#0B57D0] dark:hover:text-zinc-100 transition-colors">
                الإعدادات
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E4E7EC] dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#575C61] dark:text-zinc-500">
            <div>
              © {new Date().getFullYear()} مخطط التسويق الذكي. جميع الحقوق محفوظة.
            </div>
            <div>
              مدعوم بخوارزميات التخطيط التسويقي المتقدمة
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

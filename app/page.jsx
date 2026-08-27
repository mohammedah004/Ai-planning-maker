import { auth } from "@/auth";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

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

export const metadata = {
  title: "مخطط التسويق الذكي — خطة محتوى إنستغرام لـ 30 يوماً بالذكاء الاصطناعي",
  description:
    "حوّل وصف منتجك إلى استراتيجية تسويقية متكاملة لـ 30 يوماً على إنستغرام تشمل نصوص المنشورات، نصوص التصاميم، التوجيه البصري، وتصدير مباشر إلى Google Sheets.",
};

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("Session check ignored expired/invalid cookie on HomePage:", err?.message);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>مخطط التسويق الذكي</span>
          </Link>

          <nav className="flex items-center gap-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-sm"
              >
                <span>لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm transition-colors shadow-sm"
                >
                  <span>ابدأ الآن مجاناً</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs sm:text-sm font-medium mb-8 animate-fade-in shadow-inner">
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>مصمم خصيصاً لمنشورات وتفاعلات إنستغرام</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.25] sm:leading-[1.2]">
          أعطنا فكرة منتجك.. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            واستلم شهراً كاملاً من المحتوى التسويقي الجاهز.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          توقف عن الحيرة أمام جداول النشر الفارغة. حوّل وصف منتجك إلى استراتيجية تموضع واضحة، محاور محتوى مدروسة، 30 يوماً من أفكار منشورات إنستغرام مع نصوص التصاميم وتوجيهات بصرية وتصدير فوري إلى Google Sheets.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={session?.user ? "/dashboard" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5" />
            <span>أنشئ خطة الـ 30 يوماً الآن</span>
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-base transition-colors"
          >
            <span>كيف يعمل النظام؟</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-14 pt-8 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-indigo-400 font-bold text-sm">استراتيجية تسويقية ذكية</div>
            <div className="text-xs text-slate-400 mt-1">تحليل الجمهور المستهدف ونقاط الألم</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-purple-400 font-bold text-sm">4 صيغ نشر متنوعة</div>
            <div className="text-xs text-slate-400 mt-1">ريلز (Reels)، كاروسيل، بوست، ستوري</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-pink-400 font-bold text-sm">نصوص مخصصة للمصممين</div>
            <div className="text-xs text-slate-400 mt-1">العنوان الرئيسي، النص الفرعي، والـ CTA</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-emerald-400 font-bold text-sm">تصدير Google Sheets</div>
            <div className="text-xs text-slate-400 mt-1">ملف منظم بتبويبين جاهز للمشاركة والتنفيذ</div>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">التكامل الاستراتيجي</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">
              لماذا تفشل منشورات الذكاء الاصطناعي العشوائية وكيف نعالج ذلك؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 rounded-2xl bg-slate-950 border border-red-950/60 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 text-red-400 text-xs font-semibold mb-6 border border-red-900/50">
                <span>الطريقة التقليدية المرهقة</span>
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-4">كتابة برومبتات عامة في روبوتات المحادثة</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold text-base">✕</span>
                  <span>توليد 30 منشوراً عشوائياً بدون استراتيجية موحدة أو فهم نفسي للجمهور</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold text-base">✕</span>
                  <span>الخلط بين شكل المحتوى (Reel vs Carousel) والهدف التسويقي (توعية vs مبيعات)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold text-base">✕</span>
                  <span>فقرات نصية طويلة لا تفيد مصمم الجرافيك أو صانع الفيديو بشيء ملموس</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold text-base">✕</span>
                  <span>إضاعة ساعات طويلة في النسخ واللصق اليدوي داخل جداول البيانات</span>
                </li>
              </ul>
            </div>

            {/* The AI Marketing Planner Way */}
            <div className="p-8 rounded-2xl bg-slate-950 border border-indigo-900/60 relative shadow-xl shadow-indigo-950/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-400 text-xs font-semibold mb-6 border border-indigo-800/50">
                <Sparkles className="w-3.5 h-3.5" />
                <span>محرك AI Marketing Planner المتسلسل</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">بناء استراتيجي متكامل مرحلة بمرحلة</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>المرحلة 1:</strong> تحليل نفسية العميل، نقاط الألم المحورية، وزاوية التموضع الفريدة</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>المرحلة 2:</strong> ابتكار 3 إلى 5 محاور محتوى مع توزيع نسبي للأهداف التسويقية</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>المرحلة 3:</strong> صياغة الكابشن، نصوص التصميم (Headline + Subtext + CTA)، والتوجيه الإخراجي</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>المرحلة 4:</strong> إنشاء وتنسيق ملف Google Sheet احترافي بتبويبين جاهز للتسليم الفوري</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps How It Works */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">خطوة بخطوة</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">كيف يعمل المخطط الذكي؟</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold mb-4 text-lg">
              1
            </div>
            <h3 className="font-bold text-white mb-2">أدخل معلومات منتجك</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              اكتب اسم المنتج، الشريحة المستهدفة، المشكلة التي يحلها، النبرة المناسبة، والهدف التسويقي.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold mb-4 text-lg">
              2
            </div>
            <h3 className="font-bold text-white mb-2">بناء الاستراتيجية والمحاور</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              يحلل الذكاء الاصطناعي نقاط الألم وزوايا الإقناع ويوزع المحتوى على 3–5 ركائز أساسية.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center font-bold mb-4 text-lg">
              3
            </div>
            <h3 className="font-bold text-white mb-2">توليد تقويم الـ 30 يوماً</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              توليد منشورات يومية متوازنة مع الكابشن، نصوص التصاميم المقسمة، وصيغ النشر المناسبة.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold mb-4 text-lg">
              4
            </div>
            <h3 className="font-bold text-white mb-2">تصدير Google Sheet</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              استلام ملف Google Sheet منسق بالكامل بتبويبين وجاهز للمشاركة مع فريق التصميم وصناع المحتوى.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            جاهز لتخطيط محتوى الشهر القادم في دقائق معدودة؟
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            لا تحتاج لخبرة تسويقية معقدة. دع الذكاء الاصطناعي يتولى الاستراتيجية والجدولة والتفاصيل الإخراجية.
          </p>
          <div className="mt-8">
            <Link
              href={session?.user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-xl shadow-indigo-600/30 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              <span>ابدأ بإنشاء خطتك الآن</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} مخطط التسويق الذكي (AI Marketing Planner). جميع الحقوق محفوظة.</p>
          <p>مصمم لرواد الأعمال، صناع المحتوى، وأصحاب المتاجر والوكالات.</p>
        </div>
      </footer>
    </div>
  );
}

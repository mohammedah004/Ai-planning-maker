import { auth } from "@/auth";
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-base tracking-tight text-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              AI
            </div>
            <span>مخطط التسويق الذكي</span>
          </Link>

          <nav className="flex items-center gap-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <span>لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-sm"
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
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold mb-8">
          <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
          <span>مصمم خصيصاً لمنشورات إنستغرام لـ 30 يوماً</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.25] sm:leading-[1.2]">
          أدخل وصف منتجك.. <br className="hidden sm:block" />
          <span className="text-blue-400">
            واستلم شهراً كاملاً من المحتوى التسويقي الجاهز للتنفيذ.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          منصة تسويق احترافية تحوّل فكرة عملك إلى استراتيجية تموضع واضحة، محاور محتوى مدروسة، 30 يوماً من المنشورات المتكاملة مع نصوص التصاميم وتوجيهات الإخراج والتصدير المباشر لـ Google Sheets.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={session?.user ? "/dashboard" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 hover:scale-[1.01]"
          >
            <span>أنشئ خطة الـ 30 يوماً الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-colors"
          >
            <span>استكشف مميزات النظام</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-14 pt-10 border-t border-zinc-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400 font-medium">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>30 منشوراً متكاملاً</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>نصوص تصاميم الغرافيك</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>توجيه بصري وإخراجي</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>تصدير Google Sheets</span>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-16 bg-zinc-900/40 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              كل ما تحتاجه لإدارة محتوى إنستغرام باحترافية
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              نظام شامل يغطي الاستراتيجية والتخطيط والصياغة والمشاركة مع العملاء في مكان واحد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">تحليل الاستراتيجية والجمهور</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                استخراج نقاط الألم والمخاوف والتموضع الفريد لمنتجك لضمان توجيه الرسالة التسويقية بدقة.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">تقويم 30 يوماً مقسماً بالكامل</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                تأطير يومي يشمل الكابشن، نصوص الصور والفيديو (Design Copy)، القوالب (ريلز، كاروسيل، ستوري)، والأهداف.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">روابط مشاركة عامة للعملاء</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                إنشاء رابط مشاركة عام بضغطة زر لعرض الخطة على العميل بصيغة احترافية ومحمية للعرض فقط.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} مخطط التسويق الذكي. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}

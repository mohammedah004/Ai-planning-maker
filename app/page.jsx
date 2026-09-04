import { auth } from "@/auth";
import LandingPageClient from "@/app/components/landing/LandingPageClient";

export const metadata = {
  title: "MADAR - AI Content Planning | مدار — المنصة الذكية لتخطيط المحتوى",
  description:
    "حوّل وصف منتجك إلى استراتيجية تسويقية متكاملة لـ 30 يوماً على إنستغرام تشمل نصوص المنشورات، نصوص التصاميم الجرافيكية، التوجيه الإخراجي، وذاكرة البراند مع تصدير مباشر إلى Google Sheets عبر MADAR.",
};

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("Session check ignored expired/invalid cookie on HomePage:", err?.message);
  }

  return <LandingPageClient user={session?.user || null} />;
}

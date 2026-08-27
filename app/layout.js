import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "مخطط التسويق الذكي — خطة تسويق شهرية بالذكاء الاصطناعي لإنستغرام",
  description:
    "حوّل وصف منتجك إلى استراتيجية تسويقية متكاملة لـ 30 يوماً على إنستغرام تشمل نصوص المنشورات، نصوص التصاميم، التوجيه البصري، وتصدير ملف Google Sheet احترافي.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}

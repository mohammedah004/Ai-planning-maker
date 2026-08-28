import { Readex_Pro } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "مخطط التسويق الذكي — خطة تسويق شهرية بالذكاء الاصطناعي لإنستغرام",
  description:
    "حوّل وصف منتجك إلى استراتيجية تسويقية متكاملة لـ 30 يوماً على إنستغرام تشمل نصوص المنشورات، نصوص التصاميم، التوجيه البصري، وتصدير ملف Google Sheet احترافي.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${readex.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

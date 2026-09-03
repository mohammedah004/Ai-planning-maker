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

/**
 * Anti-FOUC script: runs synchronously in <head> before any paint.
 * Reads "theme" from localStorage and applies/removes class="dark" on <html>
 * before React hydrates — eliminates the flash of wrong color scheme.
 *
 * Logic:
 *   "dark"   → add "dark"  (or no-op since it's already the default on <html>)
 *   "light"  → remove "dark"
 *   "system" → check matchMedia, add/remove accordingly
 *   (none)   → keep "dark" (app default)
 */
const ANTI_FOUC_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else if(t==='system'){if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}else{document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: prevents React warning when the inline script
    // mutates class="dark" before hydration completes.
    // class="dark" is set here as the safe default (dark-first app).
    <html
      lang="ar"
      dir="rtl"
      className={`${readex.variable} h-full antialiased font-sans dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: apply correct theme class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-[#1A1D1F] dark:text-zinc-100 selection:bg-blue-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


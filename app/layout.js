import { Readex_Pro } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: {
    default: "MADAR - AI Content Planning",
    template: "%s | MADAR - AI Content Planning",
  },
  description:
    "MADAR (مدار) — منصة التخطيط الذكي للمحتوى وصناعة استراتيجيات إنستغرام لـ 30 يوماً بالذكاء الاصطناعي مع تصدير جداول البيانات الاحترافية.",
  icons: {
    icon: [
      { url: "/brand/madar-circular-icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/brand/madar-circular-icon.png",
  },
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


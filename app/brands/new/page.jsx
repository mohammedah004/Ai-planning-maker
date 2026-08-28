import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import BrandForm from "../BrandForm";

export const metadata = {
  title: "إضافة ملف براند جديد - مخطط التسويق الذكي",
  description: "أضف ملف براند لحفظ تفاصيل منتجك وجمهورك المستهدف ونبرته.",
};

export default async function NewBrandPage() {
  const authData = await getAuthenticatedUser();
  if (!authData?.userId) {
    redirect("/login?callbackUrl=/brands/new");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لملفات البراند</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>إضافة ملف براند جديد</span>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8 text-right">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">إضافة ملف براند جديد</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            أدخل تفاصيل منتجك وجمهورك المستهدف بدقة. سيتم حفظ هذا الملف لتوليد خطط تسويق إنستغرام بضغطة زر واحدة.
          </p>
        </div>

        <BrandForm />
      </main>
    </div>
  );
}

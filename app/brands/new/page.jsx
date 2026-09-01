import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/app/components/app-shell";
import Badge from "@/app/components/ui/Badge";
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
    <AppShell>
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Contextual Header */}
        <PageHeader
          backHref="/brands"
          backLabel="العودة لملفات البراند"
          title="إضافة ملف براند جديد"
          description="أدخل تفاصيل منتجك وجمهورك المستهدف بدقة. سيتم حفظ هذا الملف لتوليد خطط تسويق إنستغرام بضغطة زر واحدة."
          badge={<Badge variant="blue">ملف جديد</Badge>}
        />

        {/* Main Form Container */}
        <div className="max-w-3xl mx-auto pt-8">
          <BrandForm />
        </div>
      </div>
    </AppShell>
  );
}

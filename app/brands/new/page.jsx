import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
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
    <AppShell user={authData.user}>
      <div className="w-full space-y-8 text-right">
        {/* Contextual Header */}
        <PageHeader
          backHref="/brands"
          backLabel="العودة لملفات البراند"
          title="إضافة ملف براند جديد"
          description="أدخل تفاصيل منتجك وجمهورك المستهدف بدقة. سيتم حفظ هذا الملف لتوليد خطط تسويق إنستغرام بضغطة زر واحدة."
          badge={<Badge variant="blue">ملف جديد</Badge>}
        />

        {/* Main Form Container */}
        <div className="max-w-4xl">
          <BrandForm />
        </div>
      </div>
    </AppShell>
  );
}

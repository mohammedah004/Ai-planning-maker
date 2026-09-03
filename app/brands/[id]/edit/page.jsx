import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
import Badge from "@/app/components/ui/Badge";
import BrandForm from "../../BrandForm";

export const metadata = {
  title: "تعديل ملف البراند - مخطط التسويق الذكي",
  description: "تعديل بيانات وتفاصيل ملف البراند المحفوظ.",
};

export default async function EditBrandPage({ params }) {
  const authData = await getAuthenticatedUser();
  if (!authData?.userId) {
    redirect("/login");
  }

  const { id: brandId } = await params;
  const { userId } = authData;

  let brand = null;
  try {
    const { data, error } = await supabaseAdmin
      .from("brand_profiles")
      .select("*")
      .eq("id", brandId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      notFound();
    }
    brand = data;
  } catch (err) {
    console.error("Fetch brand for edit exception:", err);
    notFound();
  }

  return (
    <AppShell user={authData.user}>
      <div className="w-full space-y-8 text-right">
        {/* Contextual Header */}
        <PageHeader
          backHref="/brands"
          backLabel="العودة لملفات البراند"
          title={`تعديل: ${brand.name}`}
          description="عدّل معلومات هذا البراند. التعديلات ستنعكس على أي خطط تسويقية جديدة تنشئها باستخدام هذا الملف."
          badge={<Badge variant="amber">تعديل الملف</Badge>}
        />

        {/* Main Form Container */}
        <div className="max-w-4xl">
          <BrandForm initialData={brand} isEdit={true} brandId={brand.id} />
        </div>
      </div>
    </AppShell>
  );
}

import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AppShell, PageHeader } from "@/app/components/app-shell";
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
    <AppShell>
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Contextual Header */}
        <PageHeader
          backHref="/brands"
          backLabel="العودة لملفات البراند"
          title={`تعديل: ${brand.name}`}
          description="عدّل معلومات هذا البراند. التعديلات ستنعكس على أي خطط تسويقية جديدة تنشئها باستخدام هذا الملف."
          badge={<Badge variant="amber">تعديل الملف</Badge>}
        />

        {/* Main Form Container */}
        <div className="max-w-3xl mx-auto pt-8">
          <BrandForm initialData={brand} isEdit={true} brandId={brand.id} />
        </div>
      </div>
    </AppShell>
  );
}

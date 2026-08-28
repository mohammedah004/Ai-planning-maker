import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BrandsClient from "./BrandsClient";

export const metadata = {
  title: "ملفات البراند - مخطط التسويق الذكي",
  description: "إدارة وحفظ ملفات البراند لاستخدامها في إنشاء خطط التسويق فورياً.",
};

export default async function BrandsPage() {
  const authData = await getAuthenticatedUser();
  if (!authData?.userId) {
    redirect("/login?callbackUrl=/brands");
  }

  const { userId } = authData;
  let brands = [];

  try {
    const { data, error } = await supabaseAdmin
      .from("brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      brands = data;
    }
  } catch (err) {
    console.error("Brands fetch exception:", err);
  }

  return <BrandsClient initialBrands={brands} />;
}

import { getAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BrandsClient from "./BrandsClient";

export const metadata = {
  title: "ملفات البراند والذاكرة الذكية",
  description: "إدارة ملفات البراند واستعراض الذاكرة الاستراتيجية وتاريخ تطور الخطط في MADAR.",
};

export default async function BrandsPage() {
  const authData = await getAuthenticatedUser();
  if (!authData?.userId) {
    redirect("/login?callbackUrl=/brands");
  }

  const { userId } = authData;
  let brands = [];
  let plans = [];

  try {
    const [brandsRes, plansRes] = await Promise.all([
      supabaseAdmin
        .from("brand_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("marketing_plans")
        .select("id, brand_profile_id, product_name, marketing_objective, status, created_at, strategy")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (!brandsRes.error && brandsRes.data) {
      brands = brandsRes.data;
    }

    if (!plansRes.error && plansRes.data) {
      plans = plansRes.data;
    }
  } catch (err) {
    console.error("Brands & plans fetch exception:", err);
  }

  return <BrandsClient initialBrands={brands} initialPlans={plans} user={authData.user} />;
}

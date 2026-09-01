import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin, getCanonicalUserId } from "@/lib/supabase-admin";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "لوحة التحكم - مخطط التسويق الذكي",
  description: "إدارة وإنشاء خطط محتوى إنستغرام لـ 30 يوماً بالذكاء الاصطناعي.",
};

export default async function DashboardPage() {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("Dashboard session check ignored stale cookie:", err?.message);
  }

  if (!session?.user) {
    redirect("/login");
  }

  const userId = await getCanonicalUserId(session.user);
  let plans = [];
  let brands = [];

  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // 1. Fetch plans
      const { data: plansData, error: plansError } = await supabaseAdmin
        .from("marketing_plans")
        .select(`
          id,
          product_name,
          product_category,
          marketing_objective,
          status,
          created_at,
          updated_at,
          google_sheet_exports (
            spreadsheet_url,
            status
          ),
          generation_jobs (
            status,
            current_step,
            error_message
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (plansError) {
        console.error("Error fetching user marketing plans:", plansError);
      } else {
        plans = plansData || [];
      }

      // 2. Fetch brands
      const { data: brandsData, error: brandsError } = await supabaseAdmin
        .from("brand_profiles")
        .select("id, name, product_name, product_category, is_default, created_at")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (brandsError) {
        console.error("Error fetching user brand profiles:", brandsError);
      } else {
        brands = brandsData || [];
      }
    }
  } catch (err) {
    console.error("Supabase dashboard fetch exception:", err);
  }

  return (
    <DashboardClient
      session={session}
      initialPlans={plans}
      initialBrands={brands}
    />
  );
}

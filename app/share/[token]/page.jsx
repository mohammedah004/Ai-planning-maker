import { supabaseAdmin } from "@/lib/supabase-admin";
import PublicPlanViewer from "./components/PublicPlanViewer";

export async function generateMetadata({ params }) {
  const { token } = await params;
  if (!token) {
    return { title: "خطة تسويقية | AI Marketing Planner" };
  }

  try {
    const { data: plan } = await supabaseAdmin
      .from("marketing_plans")
      .select("product_name, product_category, marketing_objective")
      .eq("share_token", token)
      .maybeSingle();

    if (!plan) {
      return {
        title: "الخطة غير موجودة | AI Marketing Planner",
        description: "رابط المشاركة هذا غير صالح أو تم إيقافه.",
      };
    }

    const title = `خطة تسويقية: ${plan.product_name}`;
    const description = `استعراض الخطة التسويقية الاستراتيجية وتقويم المحتوى الـ 30 يوماً المصمم لـ ${plan.product_name} بواسطة AI Marketing Planner.`;

    return {
      title: `${title} | AI Marketing Planner`,
      description,
      openGraph: {
        title: `خطة تسويقية: ${plan.product_name}`,
        description,
        siteName: "AI Marketing Planner",
        locale: "ar_SA",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `خطة تسويقية: ${plan.product_name}`,
        description,
      },
    };
  } catch (err) {
    console.error("[generateMetadata] Error loading share metadata:", err);
    return { title: "خطة تسويقية | AI Marketing Planner" };
  }
}

export default async function PublicSharePage({ params }) {
  const { token } = await params;
  return <PublicPlanViewer token={token} />;
}

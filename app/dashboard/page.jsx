import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin, getCanonicalUserId } from "@/lib/supabase-admin";
import {
  Sparkles,
  Plus,
  Calendar,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
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

  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
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

      if (error) {
        console.error("Error fetching user marketing plans:", error);
      } else {
        plans = data || [];
      }
    }
  } catch (err) {
    console.error("Supabase plans fetch exception:", err);
  }

  return (
    <DashboardClient
      session={session}
      initialPlans={plans}
    />
  );
}

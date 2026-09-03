import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "الإعدادات - مخطط التسويق الذكي",
  description: "إدارة إعدادات حساب المستخدم والمظهر والتفضيلات.",
};

/**
 * SettingsPage — Server Component.
 * Follows the same auth + redirect pattern used in /dashboard and /plans/[id].
 */
export default async function SettingsPage() {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("Settings session check ignored stale cookie:", err?.message);
  }

  if (!session?.user) {
    redirect("/login");
  }

  return <SettingsClient session={session} />;
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "تسجيل الدخول - MADAR - AI Content Planning",
  description: "سجل الدخول إلى MADAR للوصول إلى خطط محتوى إنستغرام لـ 30 يوماً بالذكاء الاصطناعي.",
};

export default async function LoginPage({ searchParams }) {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("Session check ignored expired/invalid cookie:", err?.message);
  }

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return <LoginClient callbackUrl={callbackUrl} />;
}

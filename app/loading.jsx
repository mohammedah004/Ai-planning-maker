import LoadingState from "@/app/components/ui/LoadingState";

export default function Loading() {
  return (
    <LoadingState
      variant="fullscreen"
      size="lg"
      title="جاري تجهيز مساحة العمل..."
      subtitle="MADAR (مدار) يجهز بياناتك واستراتيجياتك الذكية"
    />
  );
}


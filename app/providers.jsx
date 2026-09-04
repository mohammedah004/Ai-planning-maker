"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { VoiceProvider } from "@/app/contexts/VoiceContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <VoiceProvider>
        <SessionProvider>{children}</SessionProvider>
      </VoiceProvider>
    </ThemeProvider>
  );
}

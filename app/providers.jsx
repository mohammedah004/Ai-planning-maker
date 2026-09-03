"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}

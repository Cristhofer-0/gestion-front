"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Esto garantiza que el ThemeProvider solo se renderice en el cliente
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>; // Muestra el contenido normal antes de que se monte el cliente
  }

  return <ThemeProvider attribute="class" defaultTheme="dark">{children}</ThemeProvider>;
}

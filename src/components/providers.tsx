"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry auth/permission/not-found — only transient errors.
              if (error instanceof ApiError) {
                if ([401, 403, 404].includes(error.status)) return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type FC, type ReactNode } from "react";
import { LogProvider } from "@/contexts/LogProvider";
import { AppProvider } from "@/contexts/AppContext";

const queryClient = new QueryClient();

export const Providers: FC<{
  children: ReactNode;
  partnerId?: string; // Made optional since AppProvider manages partner ID internally
}> = ({ children }) => {
  return (
    <LogProvider>
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AppProvider>
    </LogProvider>
  );
};

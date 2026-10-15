"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ToastProvider } from "@/components/ui/feedback";
import { I18nProvider } from "@/lib/i18n/provider";
export function Providers({ children }: { children: React.ReactNode }) { const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } } })); useEffect(()=>{const preference=localStorage.getItem("theme");const dark=preference?preference==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",dark)},[]); return <I18nProvider><QueryClientProvider client={client}><ToastProvider>{children}</ToastProvider></QueryClientProvider></I18nProvider>; }

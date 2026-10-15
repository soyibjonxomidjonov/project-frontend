import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Providers } from "./providers";
import "./globals.css";
export const metadata: Metadata = { title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` }, description: siteConfig.description, other: { "deploy-check": "cd-test-2026-10-15" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>; }

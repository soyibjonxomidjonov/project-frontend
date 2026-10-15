import { BarChart3, Bot, FileText, FolderKanban, LayoutDashboard, Settings2, Table2 } from "lucide-react";

export const siteConfig = {
  name: "Nexora AI",
  description: "A flexible workspace for ideas, data, and intelligent workflows.",
  logo: "/branding/logo.svg",
  domain: "generic" as "generic" | "ecology" | "education" | "hospitality" | "business" | "tourism",
  terminology: { project: "Project", resource: "Record", assistant: "Assistant" },
  navigation: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { label: "Records", href: "/dashboard/resources", icon: Table2 },
    { label: "Documents", href: "/dashboard/documents", icon: FileText },
    { label: "AI Assistant", href: "/dashboard/ai", icon: Bot },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings2 },
  ],
  enabledModules: ["projects", "resources", "documents", "ai", "analytics", "settings"],
  landing: {
    eyebrow: "A workspace that adapts to your ideas",
    headline: "Build what matters. Keep everything connected.",
    description: "A clear home for your projects, records, documents, and AI workflows. Ready to shape around your next big idea.",
    primaryCta: "Explore the workspace",
    secondaryCta: "See capabilities",
    heroImage: "",
    ai: {
      eyebrow: "AI capabilities",
      title: "A useful assistant, grounded in your work.",
      description: "The interface is prepared for conversations, document references, clear status feedback, and a real FastAPI integration.",
    },
    benefits: {
      eyebrow: "A better foundation",
      title: "Clarity from the first click.",
      items: [
        { title: "Focused projects", description: "Track work without losing the bigger picture." },
        { title: "Useful insight", description: "Bring real metrics into a clean, readable view." },
        { title: "Designed for access", description: "A sign-in flow prepared for your backend's authentication." },
        { title: "Easy to shape", description: "Central settings keep branding and terminology in one place." },
      ],
    },
    finalCta: { title: "Ready when you are.", description: "Open the workspace and connect your services to start building your next experience.", label: "Get started" },
    features: [
      { title: "Organize the work", description: "Keep initiatives and their progress in one calm, focused workspace." },
      { title: "Make data useful", description: "Search, filter, and manage the records that matter to your team." },
      { title: "Bring context together", description: "Connect documents and conversations to the work in front of you." },
    ],
  },
} as const;

export type NavItem = (typeof siteConfig.navigation)[number];

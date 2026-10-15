"use client";
import { Card } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/provider";
export function StatCard({ label, value, description, icon: Icon }: { label: string; value: string | number; description?: string; icon: React.ComponentType<{className?: string}> }) { const {t}=useI18n(); return <Card className="p-5"><div className="flex items-start justify-between"><span className="text-sm font-medium text-muted">{t(label)}</span><span className="rounded-xl bg-secondary p-2.5 text-primary"><Icon className="size-5"/></span></div><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>{description && <p className="mt-2 text-xs text-muted">{t(description)}</p>}</Card>; }

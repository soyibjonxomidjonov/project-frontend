"use client";
import { T } from "@/lib/i18n/provider";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { Button, Card } from "./primitives";
import { useI18n } from "@/lib/i18n/provider";
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { const {t}=useI18n(); return <Card className="flex flex-col items-center justify-center px-6 py-16 text-center"><span className="mb-4 rounded-2xl bg-secondary p-3 text-primary"><Inbox className="size-6" /></span><h3 className="text-lg font-bold">{t(title)}</h3><p className="mt-2 max-w-md text-sm text-muted">{t(description)}</p>{action && <div className="mt-5">{action}</div>}</Card>; }
export function ErrorState({ title = "Something went wrong", message, retry }: { title?: string; message: string; retry?: () => void }) { const {t}=useI18n(); return <Card className="flex flex-col items-center px-6 py-12 text-center"><AlertCircle className="mb-4 size-7 text-error" /><h3 className="font-bold">{t(title)}</h3><p className="mt-2 max-w-md text-sm text-muted">{t(message)}</p>{retry && <Button className="mt-5" variant="outline" onClick={retry}><T text={"Try again"} /></Button>}</Card>; }
export function LoadingState({ label = "Loading…" }: { label?: string }) { const {t}=useI18n(); return <div role="status" className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted"><LoaderCircle className="size-5 animate-spin" />{t(label)}</div>; }

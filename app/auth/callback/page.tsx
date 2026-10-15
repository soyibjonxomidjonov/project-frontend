"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/states";
import { setTokenPair } from "@/lib/api/client";
export default function CallbackPage() { const router = useRouter(); useEffect(() => { const hash = new URLSearchParams(window.location.hash.slice(1)); const access = hash.get("access_token"), refresh = hash.get("refresh_token"); window.history.replaceState(null, "", "/auth/callback"); if (!access || !refresh) { router.replace("/auth/error?reason=missing_token"); return; } setTokenPair({ access_token: access, refresh_token: refresh }); router.replace("/dashboard"); }, [router]); return <main className="grid min-h-dvh place-items-center"><LoadingState label="Completing sign in…" /></main>; }

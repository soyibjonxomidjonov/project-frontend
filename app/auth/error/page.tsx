import { T } from "@/lib/i18n/provider";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/primitives";
export default function AuthErrorPage() { return <main className="grid min-h-dvh place-items-center px-5"><Card className="max-w-md p-8 text-center"><AlertCircle className="mx-auto size-9 text-error"/><h1 className="mt-5 text-2xl font-bold"><T text={"Sign in could not be completed"} /></h1><p className="mt-3 text-sm leading-6 text-muted"><T text={"The authentication service did not return a usable session. Please try again or check the backend connection."} /></p><Link href="/login" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground"><T text={"Try again"} /></Link></Card></main>; }

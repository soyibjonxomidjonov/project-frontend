import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
export function Brand({ href = "/", compact = false }: { href?: string; compact?: boolean }) { return <Link href={href} className="inline-flex items-center gap-2.5 font-bold tracking-tight"><Image src={siteConfig.logo} alt="" width={34} height={34} className="rounded-lg" />{!compact && <span>{siteConfig.name}</span>}</Link>; }

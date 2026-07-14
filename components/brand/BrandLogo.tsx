import Link from "next/link";
import { brandConfig } from "@/config/brand.config";

export function BrandLogo() {
  return (
    <Link href="/" className="flex items-baseline gap-2">
      <span
        className="text-xl font-semibold tracking-tight sm:text-2xl"
        style={{ color: "var(--brand-accent)", fontFamily: "var(--font-display)" }}
      >
        {brandConfig.logoText}
      </span>
      <span className="hidden text-xs text-[var(--brand-muted)] sm:inline">
        {brandConfig.productName}
      </span>
    </Link>
  );
}

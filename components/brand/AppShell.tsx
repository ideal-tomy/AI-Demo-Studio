"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brandConfig } from "@/config/brand.config";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSpike = pathname?.startsWith("/spike");
  const isAdmin = pathname?.startsWith("/admin");

  if (isSpike || isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-surface)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <BrandLogo />
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <NavLink href="/" active={pathname === "/"}>
              体験
            </NavLink>
            <NavLink href="/setup" active={pathname?.startsWith("/setup")}>
              セットアップ
            </NavLink>
            <NavLink href="/studio" active={pathname?.startsWith("/studio")}>
              設定
            </NavLink>
            {brandConfig.ctaUrl ? (
              <a
                href={brandConfig.ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-1 hidden rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-white sm:inline-block"
              >
                {brandConfig.ctaLabel}
              </a>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-[var(--brand-border)] px-4 py-4 text-center text-xs text-[var(--brand-muted)] sm:px-6">
        {brandConfig.legalNotice}
      </footer>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1.5 transition ${
        active
          ? "bg-[var(--brand-accent-soft)] text-[var(--brand-accent)] font-medium"
          : "text-[var(--brand-muted)] hover:text-[var(--brand-text)]"
      }`}
    >
      {children}
    </Link>
  );
}

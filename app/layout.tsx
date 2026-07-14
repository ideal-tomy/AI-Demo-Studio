import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { brandConfig } from "@/config/brand.config";
import { DemoProvider } from "@/lib/demo-store";
import { AppShell } from "@/components/brand/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brandConfig.productName} | ${brandConfig.companyName}`,
  description: "自社ナレッジでAIを試せるデモスタジオ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = brandConfig.theme;
  const themeStyle = {
    ["--brand-accent"]: t.accent,
    ["--brand-accent-soft"]: t.accentSoft,
    ["--brand-bg"]: t.background,
    ["--brand-surface"]: t.surface,
    ["--brand-text"]: t.text,
    ["--brand-muted"]: t.muted,
    ["--brand-border"]: t.border,
  } as CSSProperties;
  return (
    <html lang="ja">
      <body style={themeStyle}>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}

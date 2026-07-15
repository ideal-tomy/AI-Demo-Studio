// BRAND-SPECIFIC
import type { BrandConfig } from "@/types/brand";

export const axeonBrand: BrandConfig = {
  id: "axeon",
  companyName: "AXEON",
  productName: "AI Demo Studio",
  logoText: "AXEON",
  contactUrl: "https://www.axeon.jp/contact",
  legalUrl: "https://www.axeon.jp/contact",
  storageNamespace: "axeon",
  ctaLabel: "AXEONに相談する",
  ctaUrl: "https://www.axeon.jp/contact",
  legalNotice:
    "本デモは検証用の体験環境です。APIキーや機密情報の取り扱いにはご注意ください。",
  theme: {
    mode: "light",
    accent: "#0F4C5C",
    accentSoft: "#E6F2F4",
    background: "#F7F8F6",
    surface: "#FFFFFF",
    text: "#1A1F1C",
    muted: "#5C6B66",
    border: "#D5DDD9",
  },
};

export const idealBrand: BrandConfig = {
  id: "ideal",
  companyName: "ideal",
  productName: "AI Demo Studio",
  logoText: "ideal",
  contactUrl: "https://example.com/ideal/contact",
  legalUrl: "https://example.com/ideal/legal",
  storageNamespace: "ideal",
  ctaLabel: "idealに相談する",
  ctaUrl: "https://example.com/ideal/contact",
  legalNotice:
    "本デモは検証用の体験環境です。APIキーや機密情報の取り扱いにはご注意ください。",
  theme: {
    mode: "light",
    accent: "#1B4D3E",
    accentSoft: "#E8F3EE",
    background: "#F5F7F6",
    surface: "#FFFFFF",
    text: "#14201B",
    muted: "#5A6B63",
    border: "#D0DCD6",
  },
};

const brands: Record<string, BrandConfig> = {
  axeon: axeonBrand,
  ideal: idealBrand,
};

/** Switch brand via NEXT_PUBLIC_BRAND_ID=axeon|ideal */
export function getActiveBrand(): BrandConfig {
  const id = (process.env.NEXT_PUBLIC_BRAND_ID || "axeon").toLowerCase();
  return brands[id] ?? axeonBrand;
}

export const brandConfig = getActiveBrand();

// BRAND-SPECIFIC types only — brand values live in config

export type BrandTheme = {
  mode: "light" | "dark";
  accent: string;
  accentSoft: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

export type BrandConfig = {
  id: string;
  companyName: string;
  productName: string;
  logoText: string;
  contactUrl?: string;
  legalUrl?: string;
  storageNamespace: string;
  ctaLabel: string;
  ctaUrl?: string;
  legalNotice: string;
  theme: BrandTheme;
};

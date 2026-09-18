export const CATEGORIES = [
  "marketData",
  "companyNews",
  "industryNews",
  "analysts",
  "macroRisks",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  marketData: "Market data",
  companyNews: "Company news",
  industryNews: "Industry news",
  analysts: "Analyst views",
  macroRisks: "Macro & risks",
};

export type EvidenceItem = {
  title: string;
  url: string;
  source: string;
  date?: string;
  snippet: string;
};

export type Evidence = Record<Category, EvidenceItem[]>;

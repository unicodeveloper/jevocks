import { Valyu, type SearchOptions } from "valyu-js";
import { CATEGORIES, type Category, type Evidence, type EvidenceItem } from "./categories";

export type { Evidence, EvidenceItem };

/** Max characters kept per result so the Jev state stays compact. */
const SNIPPET_CHARS = 900;
const RESULTS_PER_QUERY = 3;
const WEB_RESPONSE_CHARS = 1200;

let client: Valyu | undefined;
function valyu() {
  const apiKey = process.env.VALYU_API_KEY;
  if (!apiKey) throw new Error("VALYU_API_KEY is not set");
  return (client ??= new Valyu(apiKey));
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function queriesFor(ticker: string): Record<Category, { query: string; options: SearchOptions }> {
  const last30 = { startDate: isoDaysAgo(30) };
  return {
    marketData: {
      query: `${ticker} stock price, volume and returns over the last 3 months`,
      options: { searchType: "proprietary", includedSources: ["valyu/valyu-stocks"] },
    },
    companyNews: {
      query: `${ticker} company news earnings guidance product announcements`,
      options: { searchType: "news", responseLength: WEB_RESPONSE_CHARS, ...last30 },
    },
    industryNews: {
      query: `${ticker} industry sector trends competitors outlook`,
      options: { searchType: "news", responseLength: WEB_RESPONSE_CHARS, ...last30 },
    },
    analysts: {
      query: `${ticker} analyst rating price target upgrade downgrade`,
      options: { searchType: "web", fastMode: true, responseLength: WEB_RESPONSE_CHARS, ...last30 },
    },
    macroRisks: {
      query: `macroeconomic interest rates inflation risks affecting ${ticker} stock`,
      options: { searchType: "web", fastMode: true, responseLength: WEB_RESPONSE_CHARS, ...last30 },
    },
  };
}

type Bar = { datetime: string; close: number; high: number; low: number; volume: number };

function isPriceSeries(content: unknown): content is Bar[] {
  return Array.isArray(content) && content.length > 1 && typeof content[0]?.close === "number";
}

/**
 * Condenses an OHLCV series (newest first) into returns and range stats,
 * since truncating the raw array would keep only the last few days.
 */
function summarizePrices(bars: Bar[]): string {
  const sorted = [...bars].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const last = sorted[sorted.length - 1];
  const ret = (n: number) => {
    const from = sorted[Math.max(0, sorted.length - 1 - n)];
    return `${(((last.close - from.close) / from.close) * 100).toFixed(1)}%`;
  };
  const avgVol = (xs: Bar[]) => xs.reduce((s, b) => s + b.volume, 0) / xs.length;
  return JSON.stringify({
    period: `${sorted[0].datetime.slice(0, 10)} to ${last.datetime.slice(0, 10)}`,
    lastClose: last.close,
    return5d: ret(5),
    return20d: ret(20),
    returnPeriod: ret(sorted.length - 1),
    periodHigh: Math.max(...sorted.map((b) => b.high)),
    periodLow: Math.min(...sorted.map((b) => b.low)),
    volume5dVsPeriodAvg: (avgVol(sorted.slice(-5)) / avgVol(sorted)).toFixed(2),
    last10Closes: sorted.slice(-10).map((b) => b.close),
  });
}

function toSnippet(content: unknown): string {
  if (isPriceSeries(content)) return summarizePrices(content);
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (normalized.length <= SNIPPET_CHARS) return normalized;

  const clipped = normalized.slice(0, SNIPPET_CHARS);
  const boundary = Math.max(clipped.lastIndexOf("\n"), clipped.lastIndexOf(" "));
  const snippet = `${clipped.slice(0, boundary > SNIPPET_CHARS * 0.8 ? boundary : SNIPPET_CHARS).trimEnd()}…`;
  return snippet.replace(/\[([^\]]+)\]\([^)]*$/, "$1…");
}

/**
 * Runs one Valyu search per evidence category in parallel.
 * A failed category yields an empty list rather than failing the whole run.
 */
export async function gatherEvidence(ticker: string): Promise<Evidence> {
  const client = valyu();
  const queries = queriesFor(ticker);
  const entries = await Promise.all(
    CATEGORIES.map(async (category) => {
      const { query, options } = queries[category];
      try {
        const search = () =>
          client.search(query, { maxNumResults: RESULTS_PER_QUERY, responseLength: "short", ...options });
        // Valyu occasionally reports transient source outages, so retry once.
        let res = await search();
        if (!res.success) res = await search();
        if (!res.success) throw new Error(res.error ?? "search failed");
        const items: EvidenceItem[] = res.results.map((r) => ({
          title: r.title,
          url: r.url,
          source: r.source,
          date: r.publication_date ?? r.date,
          snippet: toSnippet(r.content),
        }));
        return [category, items] as const;
      } catch (err) {
        console.error(`[valyu] ${category} search failed:`, err);
        return [category, [] as EvidenceItem[]] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as Evidence;
}

"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { CATEGORIES, CATEGORY_LABELS, type Evidence } from "@/lib/categories";
import type { Classification, DecisionEngine, Signal } from "@/lib/classify";

type AnalyzeResponse = {
  ticker: string;
  decisionEngine: DecisionEngine;
  evidence: Evidence;
  classification: Classification;
  timing: {
    evidenceMs: number;
    decisionMs: number;
    totalMs: number;
  };
};

const SIGNAL_STYLES: Record<Signal, string> = {
  bullish: "text-[#4ed477]",
  neutral: "text-[#9b7cff]",
  bearish: "text-[#ff6262]",
};

const QUALITY_LABELS = ["Thin", "Partial", "Strong"];
const AS_OF_DATE = new Date().toISOString().slice(0, 10);

const pct = (n: number) => `${Math.round(n * 100)}%`;

const STOCKS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AVGO", name: "Broadcom" },
  { symbol: "BRK.B", name: "Berkshire Hathaway" },
  { symbol: "JPM", name: "JPMorgan Chase" },
  { symbol: "LLY", name: "Eli Lilly" },
  { symbol: "V", name: "Visa" },
  { symbol: "UNH", name: "UnitedHealth" },
  { symbol: "XOM", name: "Exxon Mobil" },
  { symbol: "MA", name: "Mastercard" },
  { symbol: "COST", name: "Costco" },
  { symbol: "WMT", name: "Walmart" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "PG", name: "Procter & Gamble" },
  { symbol: "HD", name: "Home Depot" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "BAC", name: "Bank of America" },
  { symbol: "ABBV", name: "AbbVie" },
  { symbol: "CRM", name: "Salesforce" },
  { symbol: "KO", name: "Coca-Cola" },
  { symbol: "ORCL", name: "Oracle" },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "ADBE", name: "Adobe" },
  { symbol: "CSCO", name: "Cisco" },
  { symbol: "PEP", name: "PepsiCo" },
  { symbol: "TMO", name: "Thermo Fisher Scientific" },
  { symbol: "ACN", name: "Accenture" },
  { symbol: "MCD", name: "McDonald's" },
  { symbol: "ABT", name: "Abbott Laboratories" },
  { symbol: "INTC", name: "Intel" },
  { symbol: "DIS", name: "Disney" },
  { symbol: "IBM", name: "IBM" },
  { symbol: "GE", name: "GE Aerospace" },
  { symbol: "QCOM", name: "Qualcomm" },
  { symbol: "TXN", name: "Texas Instruments" },
  { symbol: "NOW", name: "ServiceNow" },
  { symbol: "UBER", name: "Uber" },
  { symbol: "SHOP", name: "Shopify" },
  { symbol: "PLTR", name: "Palantir" },
  { symbol: "COIN", name: "Coinbase" },
  { symbol: "MSTR", name: "MicroStrategy" },
  { symbol: "SMCI", name: "Super Micro Computer" },
  { symbol: "NKE", name: "Nike" },
  { symbol: "BA", name: "Boeing" },
  { symbol: "F", name: "Ford" },
  { symbol: "GM", name: "General Motors" },
  { symbol: "ASML.AS", name: "ASML" },
  { symbol: "NESN.SW", name: "Nestle" },
  { symbol: "NOVN.SW", name: "Novartis" },
  { symbol: "ROG.SW", name: "Roche" },
  { symbol: "SHEL.L", name: "Shell" },
  { symbol: "AZN.L", name: "AstraZeneca" },
  { symbol: "HSBA.L", name: "HSBC" },
  { symbol: "BP.L", name: "BP" },
  { symbol: "ULVR.L", name: "Unilever" },
  { symbol: "GSK.L", name: "GSK" },
  { symbol: "RIO.L", name: "Rio Tinto" },
  { symbol: "REL.L", name: "RELX" },
  { symbol: "DGE.L", name: "Diageo" },
  { symbol: "LLOY.L", name: "Lloyds Banking Group" },
  { symbol: "BARC.L", name: "Barclays" },
  { symbol: "UBSG.SW", name: "UBS" },
  { symbol: "OR.PA", name: "L'Oreal" },
  { symbol: "TTE.PA", name: "TotalEnergies" },
  { symbol: "SAN.PA", name: "Sanofi" },
  { symbol: "AIR.PA", name: "Airbus" },
  { symbol: "MC.PA", name: "LVMH" },
  { symbol: "BNP.PA", name: "BNP Paribas" },
  { symbol: "SU.PA", name: "Schneider Electric" },
  { symbol: "AI.PA", name: "Air Liquide" },
  { symbol: "DG.PA", name: "Vinci" },
  { symbol: "SAP.DE", name: "SAP" },
  { symbol: "SIE.DE", name: "Siemens" },
  { symbol: "ALV.DE", name: "Allianz" },
  { symbol: "DTE.DE", name: "Deutsche Telekom" },
  { symbol: "BAYN.DE", name: "Bayer" },
  { symbol: "BAS.DE", name: "BASF" },
  { symbol: "MBG.DE", name: "Mercedes-Benz Group" },
  { symbol: "BMW.DE", name: "BMW" },
  { symbol: "VOW3.DE", name: "Volkswagen" },
  { symbol: "IFX.DE", name: "Infineon" },
  { symbol: "NOVO-B.CO", name: "Novo Nordisk" },
  { symbol: "NDA-SE.ST", name: "Nordea Bank" },
  { symbol: "ERIC-B.ST", name: "Ericsson" },
  { symbol: "VOLV-B.ST", name: "Volvo" },
  { symbol: "ATCO-A.ST", name: "Atlas Copco" },
  { symbol: "SAN.MC", name: "Banco Santander" },
  { symbol: "IBE.MC", name: "Iberdrola" },
  { symbol: "ITX.MC", name: "Inditex" },
  { symbol: "BBVA.MC", name: "BBVA" },
  { symbol: "ENEL.MI", name: "Enel" },
  { symbol: "ENI.MI", name: "Eni" },
  { symbol: "ISP.MI", name: "Intesa Sanpaolo" },
  { symbol: "UCG.MI", name: "UniCredit" },
  { symbol: "INGA.AS", name: "ING" },
  { symbol: "AD.AS", name: "Ahold Delhaize" },
];

function normalizeTicker(value: string) {
  return value.trim().toUpperCase();
}

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [decisionEngine, setDecisionEngine] = useState<DecisionEngine>("jev");
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const normalizedTicker = normalizeTicker(ticker);
  const suggestions = normalizedTicker
    ? STOCKS.filter(
        (stock) =>
          stock.symbol.startsWith(normalizedTicker) || stock.name.toUpperCase().includes(normalizedTicker),
      ).slice(0, 5)
    : [];
  const topSuggestion = suggestions[0];

  async function analyze(nextTicker: string) {
    const symbol = normalizeTicker(nextTicker);
    if (!symbol) return;

    const startedAt = window.performance.now();
    setTicker(symbol);
    setLoading(true);
    setError(null);
    setData(null);
    setElapsedMs(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: symbol, decisionEngine }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setElapsedMs(window.performance.now() - startedAt);
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await analyze(topSuggestion?.symbol ?? ticker);
  }

  async function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;

    e.preventDefault();
    await analyze(topSuggestion?.symbol ?? ticker);
  }

  return (
    <main className="min-h-[100dvh] flex-1 bg-[#020302] font-mono text-[#d7d7d2]">
      <div className="mx-auto w-full max-w-[1500px] border-x border-[#151815] bg-[#050605]">
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[#292c29] bg-[#080908] px-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="bg-[#ffb000] px-2 py-1 text-xs font-bold text-black">JVNK</span>
            <span className="text-sm font-semibold text-[#efefe9]">JEVINIK TERMINAL</span>
            <span className="hidden text-xs text-[#555752] sm:inline">/ EQUITY DECISION SYSTEM</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.12em] text-[#686a65]">
            <span>30D MODEL</span>
            <span className="text-[#44d071]">● LIVE</span>
          </div>
        </header>

        <nav className="hidden h-9 items-center border-b border-[#1c1f1c] bg-[#050605] px-5 text-[10px] uppercase tracking-[0.14em] text-[#666863] md:flex">
          <span className="mr-8 text-[#ffb000]">EQUITIES</span>
          <span className="mr-8">US + EU</span>
          <span className="mr-8">VALYU DATA</span>
          <span className="mr-auto">JEV / GPT-5</span>
          <span>AS OF {AS_OF_DATE}</span>
        </nav>

        <section className="border-b border-[#292c29] p-3 sm:p-5">
          <form onSubmit={onSubmit}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="ticker" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ffb000]">
                Security command
              </label>
              <span className="text-[10px] text-[#555752]">ENTER TO EXECUTE</span>
            </div>
            <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_auto_auto]">
              <div className="relative min-w-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#ffb000]">&gt;</span>
                <input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyDown={onInputKeyDown}
                  placeholder="TYPE TICKER OR COMPANY"
                  maxLength={10}
                  autoComplete="off"
                  className="h-11 w-full border border-[#3a3d39] bg-black pl-8 pr-3 text-base uppercase tracking-[0.08em] text-[#f0f0ea] outline-none placeholder:text-[#41433f] focus:border-[#ffb000] sm:text-sm"
                />
                {suggestions.length > 0 && normalizedTicker !== topSuggestion?.symbol ? (
                  <div className="absolute left-0 right-0 top-full z-10 border border-[#3a3d39] bg-[#070807] shadow-2xl">
                    {suggestions.map((stock, index) => (
                      <button
                        key={stock.symbol}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void analyze(stock.symbol)}
                        className="grid min-h-11 w-full grid-cols-[24px_90px_minmax(0,1fr)] items-center border-b border-[#171917] px-3 py-2 text-left text-xs last:border-0 hover:bg-[#16130a] focus-visible:bg-[#16130a] focus-visible:outline-none"
                      >
                        <span className="text-[#4b4d48]">{index + 1}</span>
                        <span className="font-semibold text-[#ffb000]">{stock.symbol}</span>
                        <span className="truncate text-[#8b8d87]">{stock.name}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <fieldset className="grid grid-cols-2 border border-[#3a3d39]" aria-label="Decision engine">
                <legend className="sr-only">Decision engine</legend>
                {(["jev", "llm"] as const).map((engine) => {
                  const selected = decisionEngine === engine;
                  return (
                    <button
                      key={engine}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setDecisionEngine(engine)}
                      className={`h-11 min-w-24 border-r border-[#3a3d39] px-4 text-xs font-semibold uppercase last:border-r-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#ffb000] ${
                        selected ? "bg-[#ffb000] text-black" : "bg-[#090a09] text-[#73756f] hover:text-[#d7d7d2]"
                      }`}
                    >
                      {engine === "jev" ? "JEV" : "GPT-5"}
                    </button>
                  );
                })}
              </fieldset>

              <button
                type="submit"
                disabled={loading || !normalizedTicker}
                className="h-11 bg-[#e6e6df] px-6 text-xs font-bold uppercase tracking-[0.1em] text-black hover:bg-white active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#252724] disabled:text-[#5b5d58]"
              >
                {loading ? "RUNNING..." : "ANALYZE"}
              </button>
            </div>
          </form>
        </section>

        {loading ? (
          <section className="border-b border-[#292c29] bg-black p-5" aria-live="polite">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#ffb000]">PROCESSING {normalizedTicker}</span>
              <span className="text-[#666863]">VALYU SEARCH → {decisionEngine === "jev" ? "JEV EVALUATE" : "GPT-5 INFERENCE"}</span>
            </div>
            <div className="mt-4 h-1 overflow-hidden bg-[#222422]">
              <div className="analysis-scan h-full w-1/3 bg-[#ffb000]" />
            </div>
          </section>
        ) : null}

        {error ? (
          <div className="border-b border-[#4b2020] bg-[#160808] px-5 py-4 text-xs text-[#ff6b6b]" role="alert">
            <span className="mr-3 font-bold">ERROR 01</span>{error}
            {elapsedMs !== null ? <span className="ml-3 text-[#985252]">[{(elapsedMs / 1000).toFixed(1)} SEC]</span> : null}
          </div>
        ) : null}

        {data ? (
          <Result data={data} elapsedMs={elapsedMs} />
        ) : !loading && !error ? (
          <section className="grid min-h-[560px] lg:grid-cols-[1fr_360px]">
            <div className="flex items-center justify-center border-b border-[#1e211e] p-8 text-center lg:border-b-0 lg:border-r">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb000]">Ready for command</p>
                <h1 className="mt-4 text-2xl font-medium tracking-[-0.03em] text-[#e8e8e2] sm:text-3xl">Evidence-backed equity decisions</h1>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#686a65]">
                  Enter a US or European ticker. Jev prioritizes speed; GPT-5 provides the general-model comparison.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {["AAPL", "NVDA", "TSLA", "ASML.AS"].map((symbol) => (
                    <button key={symbol} type="button" onClick={() => void analyze(symbol)} className="min-h-11 border border-[#30332f] px-3 py-2 text-xs text-[#969892] hover:border-[#ffb000] hover:text-[#ffb000]">
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <aside className="bg-[#070807] p-5 text-xs">
              <h2 className="font-semibold uppercase tracking-[0.12em] text-[#9b7cff]">System status</h2>
              <dl className="mt-5 space-y-3 text-[#747670]">
                <div className="flex justify-between border-b border-[#1a1c1a] pb-2"><dt>Market data</dt><dd className="text-[#44d071]">ONLINE</dd></div>
                <div className="flex justify-between border-b border-[#1a1c1a] pb-2"><dt>News search</dt><dd className="text-[#44d071]">ONLINE</dd></div>
                <div className="flex justify-between border-b border-[#1a1c1a] pb-2"><dt>Jev evaluator</dt><dd className="text-[#44d071]">READY</dd></div>
                <div className="flex justify-between border-b border-[#1a1c1a] pb-2"><dt>GPT-5</dt><dd className="text-[#44d071]">READY</dd></div>
              </dl>
            </aside>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Result({ data, elapsedMs }: { data: AnalyzeResponse; elapsedMs: number | null }) {
  const { ticker, evidence, classification: c } = data;
  const up = c.probabilityUp >= 0.5;
  const sourceCount = Object.values(evidence).reduce((total, items) => total + items.length, 0);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#292c29] bg-black px-3 py-3 text-xs sm:px-5">
        <span className="text-base font-bold text-[#ffb000]">{ticker}</span>
        <span className="text-[#858781]">30-DAY OUTLOOK</span>
        <span className="text-[#3f413d]">|</span>
        <span className="text-[#9b7cff]">{data.decisionEngine === "jev" ? "JEV" : "GPT-5"}</span>
        <span className="w-full text-right text-[#656762] min-[400px]:ml-auto min-[400px]:w-auto">COMPLETE IN <strong className="text-[#e4e4de]">{elapsedMs === null ? "--" : `${(elapsedMs / 1000).toFixed(1)}S`}</strong></span>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-[#292c29] p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#ffb000]">Decision summary</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1.15fr] sm:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#60625d]">P(higher in 30 days)</p>
              <p className={`mt-1 text-6xl font-medium leading-none tracking-[-0.06em] tabular-nums sm:text-7xl ${up ? "text-[#4ed477]" : "text-[#ff6262]"}`}>
                {pct(c.probabilityUp)}
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-[#202320] text-xs">
              <div className="border-b border-r border-[#202320] p-3">
                <dt className="text-[#5e605b]">OUTLOOK</dt>
                <dd className={`mt-1 font-semibold uppercase ${up ? "text-[#4ed477]" : "text-[#ff6262]"}`}>{c.outlookLabel}</dd>
              </div>
              <div className="border-b border-[#202320] p-3">
                <dt className="text-[#5e605b]">QUALITY</dt>
                <dd className="mt-1 font-semibold uppercase text-[#e0e0da]">{QUALITY_LABELS[Math.round(c.evidenceQuality)]}</dd>
              </div>
              <div className="border-r border-[#202320] p-3">
                <dt className="text-[#5e605b]">SOURCES</dt>
                <dd className="mt-1 font-semibold text-[#e0e0da]">{sourceCount}</dd>
              </div>
              <div className="p-3">
                <dt className="text-[#5e605b]">ENGINE</dt>
                <dd className="mt-1 font-semibold text-[#9b7cff]">{data.decisionEngine === "jev" ? "JEV" : "GPT-5"}</dd>
              </div>
              <div className="border-r border-t border-[#202320] p-3">
                <dt className="text-[#5e605b]">DATA TIME</dt>
                <dd className="mt-1 font-semibold text-[#e0e0da]">{(data.timing.evidenceMs / 1000).toFixed(1)}S</dd>
              </div>
              <div className="border-t border-[#202320] p-3">
                <dt className="text-[#5e605b]">DECISION TIME</dt>
                <dd className="mt-1 font-semibold text-[#ffb000]">{(data.timing.decisionMs / 1000).toFixed(1)}S</dd>
              </div>
            </dl>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-[10px] text-[#585a55]"><span>0% LOWER</span><span>50%</span><span>100% HIGHER</span></div>
            <div className="h-3 border border-[#2a2d29] bg-[#111311] p-0.5">
              <div className={`h-full ${up ? "bg-[#4ed477]" : "bg-[#ff6262]"}`} style={{ width: pct(c.probabilityUp) }} />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b7cff]">Category signals</h2>
          <div className="mt-4 border-t border-[#202320]">
            {CATEGORIES.map((cat, index) => {
              const signal = c.signals[cat].signal;
              return (
                <div key={cat} className="grid grid-cols-[24px_1fr_auto] items-center border-b border-[#171a17] py-2.5 text-xs">
                  <span className="text-[#454743]">{index + 1}</span>
                  <span className="text-[#aaa9a4]">{CATEGORY_LABELS[cat]}</span>
                  <span className={`font-semibold uppercase ${SIGNAL_STYLES[signal]}`}>● {signal}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[#292c29] bg-[#030403] p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#ffb000]">Evidence monitor</h2>
          <span className="text-[10px] text-[#535550]">SELECT ROW TO EXPAND</span>
        </div>
        <div className="grid gap-2 xl:grid-cols-2">
          {CATEGORIES.map((cat, categoryIndex) => {
            const signal = c.signals[cat].signal;
            const items = evidence[cat];
            return (
              <details key={cat} className="group min-w-0 max-w-full border border-[#232623] bg-[#070807]">
                <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[26px_minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-3 text-xs marker:hidden hover:bg-[#0e100e]">
                  <span className="text-[#4b4d48]">0{categoryIndex + 1}</span>
                  <span className="font-semibold uppercase text-[#c3c3bd]">{CATEGORY_LABELS[cat]}</span>
                  <span className={`uppercase ${SIGNAL_STYLES[signal]}`}>{signal}</span>
                  <span className="text-[#555752] group-open:rotate-45">+</span>
                </summary>
                <ul className="border-t border-[#232623]">
                  {items.length === 0 ? <li className="px-3 py-4 text-xs text-[#5d5f5a]">NO RESULTS</li> : null}
                  {items.map((item, index) => (
                    <li key={`${item.url}-${index}`} className="border-b border-[#171917] px-3 py-3 text-xs last:border-b-0">
                      <div className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)] gap-2">
                        <span className="text-[#444641]">{index + 1}</span>
                        <div className="min-w-0">
                          <a href={item.url} target="_blank" rel="noreferrer" className="break-words leading-5 text-[#c7c7c1] [overflow-wrap:anywhere] hover:text-[#ffb000] hover:underline">
                            {item.title}
                          </a>
                          <p className="mt-1 break-words text-[10px] uppercase tracking-[0.06em] text-[#535550] [overflow-wrap:anywhere]">{item.source}{item.date && ` / ${item.date.slice(0, 10)}`}</p>
                          <p className="mt-2 line-clamp-2 break-words leading-5 text-[#777974] [overflow-wrap:anywhere]">{item.snippet}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>

      <footer className="flex flex-col gap-1 border-t border-[#292c29] bg-black px-5 py-3 text-[9px] uppercase tracking-[0.1em] text-[#484a46] sm:flex-row sm:justify-between">
        <span>JEVINIK / NOT FINANCIAL ADVICE</span>
        <span>ESTIMATES GENERATED FROM RETRIEVED EVIDENCE</span>
      </footer>
    </section>
  );
}

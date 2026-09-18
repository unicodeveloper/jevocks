import { z } from "zod";
import { gatherEvidence } from "@/lib/evidence";
import { classify } from "@/lib/classify";

export const maxDuration = 60;

const bodySchema = z.object({
  ticker: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z][A-Z0-9.\-]{0,9}$/, "Enter a valid ticker, e.g. AAPL"),
  decisionEngine: z.enum(["jev", "llm"]).default("jev"),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { ticker, decisionEngine } = parsed.data;

  try {
    const evidence = await gatherEvidence(ticker);
    const total = Object.values(evidence).reduce((n, items) => n + items.length, 0);
    if (total === 0) {
      return Response.json({ error: `No evidence found for ${ticker}` }, { status: 404 });
    }
    const classification = await classify(ticker, evidence, decisionEngine);
    return Response.json({ ticker, decisionEngine, evidence, classification });
  } catch (err) {
    console.error("[analyze]", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

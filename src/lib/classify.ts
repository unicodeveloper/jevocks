import { experimental_evaluate, generateObject, type Experimental_EvaluationQuestion } from "ai";
import { z } from "zod";
import { CATEGORIES, CATEGORY_LABELS, type Category, type Evidence } from "./categories";

/** Jev via Vercel AI Gateway (uses AI_GATEWAY_API_KEY). */
const JEV_MODEL = "typesafe-ai/jev";
const LLM_MODEL = process.env.LLM_MODEL ?? "openai/gpt-5";

export const HORIZON_DAYS = 30;

const OUTLOOK_LEVELS = [
  "Strongly bearish: evidence points clearly to a price decline",
  "Bearish: evidence leans toward a decline",
  "Neutral: mixed or balanced evidence",
  "Bullish: evidence leans toward a rise",
  "Strongly bullish: evidence points clearly to a price rise",
];

const SIGNAL_CRITERIA = {
  bullish: "Supports the share price rising",
  neutral: "Mixed, irrelevant, or no meaningful signal",
  bearish: "Supports the share price falling",
};

function categoryQuestion(ticker: string, c: Category) {
  return {
    type: "choice" as const,
    instructions: `Considering ONLY the "${c}" evidence (${CATEGORY_LABELS[c]}), what does it imply for ${ticker}'s share price? If that evidence is empty, answer neutral.`,
    criteria: SIGNAL_CRITERIA,
  };
}

function buildQuestions(ticker: string) {
  const perCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c, categoryQuestion(ticker, c)]),
  ) as Record<Category, ReturnType<typeof categoryQuestion>>;

  return {
    priceUp: {
      type: "boolean",
      instructions: `Based on all the evidence, will ${ticker}'s share price be higher ${HORIZON_DAYS} days from the as-of date than it is on the as-of date?`,
    },
    outlook: {
      type: "score",
      instructions: `Overall ${HORIZON_DAYS}-day outlook for ${ticker}'s share price, weighing all evidence.`,
      criteria: OUTLOOK_LEVELS,
    },
    evidenceQuality: {
      type: "score",
      instructions: `How complete, recent, and specific to ${ticker} is the evidence for making this call?`,
      criteria: ["Thin or off-topic", "Partial", "Strong and specific"],
    },
    ...perCategory,
  } satisfies Record<string, Experimental_EvaluationQuestion>;
}

export type Signal = keyof typeof SIGNAL_CRITERIA;
export type DecisionEngine = "jev" | "llm";

export type Classification = {
  probabilityUp: number;
  outlookScore: number;
  outlookLabel: string;
  evidenceQuality: number;
  signals: Record<Category, { signal: Signal; probabilities?: Record<string, number> }>;
};

function compactState(ticker: string, evidence: Evidence) {
  return {
    ticker,
    asOfDate: new Date().toISOString().slice(0, 10),
    horizonDays: HORIZON_DAYS,
    evidence: Object.fromEntries(
      CATEGORIES.map((c) => [
        c,
        evidence[c].map(({ title, source, date, snippet }) => ({ title, source, date, snippet })),
      ]),
    ),
  };
}

function cleanScore(value: number, max: number) {
  return Math.min(max, Math.max(0, value));
}

async function classifyWithJev(ticker: string, evidence: Evidence): Promise<Classification> {
  const state = {
    ...compactState(ticker, evidence),
  };

  const result = await experimental_evaluate({
    model: JEV_MODEL,
    // JSON round-trip drops undefined fields, which Jev rejects as non-JSON state.
    state: JSON.parse(JSON.stringify(state)),
    questions: buildQuestions(ticker),
  });

  const { answers } = result;
  const signals = Object.fromEntries(
    CATEGORIES.map((c) => {
      const a = answers[c];
      return [c, { signal: a.choice, probabilities: a.probabilities }];
    }),
  ) as Classification["signals"];

  return {
    probabilityUp: answers.priceUp.probability,
    outlookScore: answers.outlook.score,
    outlookLabel: OUTLOOK_LEVELS[Math.round(answers.outlook.score)].split(":")[0],
    evidenceQuality: answers.evidenceQuality.score,
    signals,
  };
}

const signalSchema = z.enum(["bullish", "neutral", "bearish"]);

const llmClassificationSchema = z.object({
  probabilityUp: z.number().min(0).max(1),
  outlookScore: z.number().min(0).max(4),
  evidenceQuality: z.number().min(0).max(2),
  signals: z.object(
    Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        z.object({
          signal: signalSchema,
        }),
      ]),
    ) as Record<Category, z.ZodObject<{ signal: typeof signalSchema }>>,
  ),
});

async function classifyWithLlm(ticker: string, evidence: Evidence): Promise<Classification> {
  const { object } = await generateObject({
    model: LLM_MODEL,
    schema: llmClassificationSchema,
    prompt: `You are classifying short-term stock evidence for a ${HORIZON_DAYS}-day outlook.

Return only the requested structured fields.
- probabilityUp must be 0 to 1.
- outlookScore must be 0 to 4, matching: ${OUTLOOK_LEVELS.join(" | ")}.
- evidenceQuality must be 0 to 2, matching: Thin or off-topic | Partial | Strong and specific.
- Each category signal must be bullish, neutral, or bearish.

Evidence state:
${JSON.stringify(compactState(ticker, evidence))}`,
  });

  return {
    probabilityUp: cleanScore(object.probabilityUp, 1),
    outlookScore: cleanScore(object.outlookScore, 4),
    outlookLabel: OUTLOOK_LEVELS[Math.round(cleanScore(object.outlookScore, 4))].split(":")[0],
    evidenceQuality: cleanScore(object.evidenceQuality, 2),
    signals: object.signals,
  };
}

export async function classify(
  ticker: string,
  evidence: Evidence,
  decisionEngine: DecisionEngine,
): Promise<Classification> {
  return decisionEngine === "jev" ? classifyWithJev(ticker, evidence) : classifyWithLlm(ticker, evidence);
}

# Jevinik

Enter a stock ticker. The app runs five fast Valyu searches in parallel (market data, company news, industry news, analyst views, and macro/risks), then classifies the evidence with either TypeSafe's **Jev** evaluation model or **GPT-5** through Vercel AI Gateway.

Jev returns:

- **P(up)**: probability the price is higher in 30 days (boolean question)
- **Outlook**: 5-level score from strongly bearish to strongly bullish
- **Evidence quality**: thin / partial / strong
- **Per-category signal**: bullish / neutral / bearish for each evidence bucket
- **Completion time**: end-to-end analysis latency

## Setup

```sh
cp .env.example .env.local   # fill in AI_GATEWAY_API_KEY and VALYU_API_KEY
npm install
npm run dev
```

## Code map

- `src/lib/evidence.ts`: Valyu searches (`valyu-js`)
- `src/lib/classify.ts`: Jev evaluation and GPT-5 structured classification
- `src/app/api/analyze/route.ts`: POST `{ ticker, decisionEngine }` → evidence + classification
- `src/app/page.tsx`: Bloomberg-inspired terminal UI

Not financial advice.

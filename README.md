# Jevinik

Jevinik is a stock decision terminal that retrieves live market evidence with Valyu and estimates whether a stock will trade higher in 30 days.

Users can compare two decision engines against the same evidence:

- **Jev**: a purpose-built evaluation model optimized for fast, structured decisions.
- **GPT-5**: a general-purpose LLM comparison using structured output.

The interface reports the probability of a higher price, overall outlook, evidence quality, category-level signals, supporting sources, and end-to-end completion time.

## Features

- Autocomplete for common US and European stocks
- Five Valyu searches executed in parallel
- Fast Valyu web mode for analyst and macro evidence
- Jev and GPT-5 decision toggle
- Bullish, neutral, and bearish signals by evidence category
- Source-level evidence inspection
- End-to-end request timing
- Responsive Bloomberg-inspired terminal interface

## How It Works

1. The user enters a ticker and chooses `JEV` or `GPT-5`.
2. The API validates and normalizes the ticker.
3. Valyu searches five evidence categories in parallel:
   - Market data
   - Company news
   - Industry news
   - Analyst views
   - Macro risks
4. Price history is condensed into returns, range, volume, and recent-close statistics.
5. The selected engine evaluates the same compact evidence state.
6. The API returns the probability, outlook, evidence quality, category signals, and source evidence.

SEC filings are currently disabled in the application flow. The Valyu SEC source can be re-enabled later when desired.

## Requirements

- Node.js 20 or newer
- npm
- A Valyu API key
- A Vercel AI Gateway API key

## API Keys

### Valyu

Valyu supplies the market, news, analyst, and macro evidence.

1. Create or sign in to a Valyu account at [platform.valyu.ai](https://platform.valyu.ai/).
2. Create an API key in the Valyu dashboard.
3. Confirm the account can access the proprietary stock source used by this app: `valyu/valyu-stocks`.
4. Add the key to `VALYU_API_KEY` in `.env.local`.

The application also uses Valyu `news` and fast `web` searches. If Valyu returns `Forbidden`, check that the key is current, the account has sufficient quota, and proprietary financial-source access is enabled.

Valyu documentation: [docs.valyu.ai](https://docs.valyu.ai/)

### Vercel AI Gateway

Vercel AI Gateway routes requests to both `typesafe-ai/jev` and the configured LLM.

1. Open the AI Gateway section in your Vercel account.
2. Create an AI Gateway API key.
3. Ensure the account can access `typesafe-ai/jev` and `openai/gpt-5`.
4. Add the key to `AI_GATEWAY_API_KEY` in `.env.local`.

AI Gateway documentation: [vercel.com/docs/ai-gateway](https://vercel.com/docs/ai-gateway)

## Local Setup

Clone the repository and install dependencies:

```sh
git clone git@github.com:unicodeveloper/jevocks.git
cd jevocks
npm install
```

Create the local environment file:

```sh
cp .env.example .env.local
```

Set the required values:

```env
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
VALYU_API_KEY=your_valyu_key

# Optional. Defaults to openai/gpt-5.
LLM_MODEL=openai/gpt-5
```

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Do not commit `.env.local`. It is ignored by Git.

## Decision Engines

### Jev

Jev uses the AI SDK evaluation API through `experimental_evaluate` and model `typesafe-ai/jev`. It answers typed boolean, score, and choice questions against one shared evidence state.

Jev is the default because it is substantially faster for this structured decision workflow.

### GPT-5

The LLM path uses AI SDK `generateObject` with a Zod schema so its response matches the Jev classification contract.

The default model is:

```text
openai/gpt-5
```

Set `LLM_MODEL` to another AI Gateway model ID to change it without modifying code.

## API

### `POST /api/analyze`

Request:

```json
{
  "ticker": "AAPL",
  "decisionEngine": "jev"
}
```

`decisionEngine` accepts `jev` or `llm` and defaults to `jev`.

Example:

```sh
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","decisionEngine":"jev"}'
```

The response contains:

- Normalized ticker
- Selected decision engine
- Evidence grouped by category
- Probability the price is higher in 30 days
- Outlook score and label
- Evidence quality score
- Category-level signals

## Scripts

```sh
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Create and type-check the production build
npm start      # Start the production server
```

## Deployment

For Vercel deployment:

1. Import the GitHub repository into Vercel.
2. Add `VALYU_API_KEY` and `AI_GATEWAY_API_KEY` under Project Settings → Environment Variables.
3. Optionally add `LLM_MODEL`.
4. Deploy.

The analysis route allows up to 60 seconds because GPT-5 can take considerably longer than Jev.

## Troubleshooting

### `VALYU_API_KEY is not set`

Create `.env.local`, add the key, and restart the development server.

### Valyu returns `Forbidden`

- Verify the key in `.env.local` is current.
- Restart the server after changing environment variables.
- Check Valyu usage and quota.
- Confirm access to `valyu/valyu-stocks`.

### `No evidence found for TICKER`

Every Valyu category failed or returned no results. Check the server logs for category-specific errors and test the Valyu key directly.

### AI Gateway authorization or model errors

- Verify `AI_GATEWAY_API_KEY`.
- Confirm access to `typesafe-ai/jev` and the configured `LLM_MODEL`.
- Check that `LLM_MODEL` uses the `provider/model` format.

### GPT-5 is much slower than Jev

This is expected. Jev is optimized for typed evaluation, while GPT-5 performs a general-purpose structured generation request.

## Project Structure

```text
src/
├── app/
│   ├── api/analyze/route.ts  # Validation and analysis endpoint
│   ├── globals.css           # Global terminal theme
│   ├── layout.tsx            # Fonts and metadata
│   └── page.tsx              # Interactive terminal UI
└── lib/
    ├── categories.ts         # Evidence category types and labels
    ├── classify.ts           # Jev and GPT-5 decision engines
    └── evidence.ts           # Valyu evidence collection
```

## Security

- Keep all API keys server-side in environment variables.
- Never expose keys through client components or browser logs.
- Never commit `.env.local` or other credential files.
- Rotate any key that is accidentally exposed.

## Disclaimer

Jevinik is not financial advice. Its estimates are generated from retrieved evidence and model outputs and may be incomplete or incorrect.

# Revenue Rescue

AI-powered, chat-with-your-CSV data assistant. Upload a CSV, ask questions in natural language, and get instant business insights, summaries, and dashboards—no formulas or SQL required. 
revenue-rescue.vercel.app

**Live demo**: revenue-rescue.vercel.app (deployed on Vercel). 

#Table of Contents

Features

Tech Stack

Project Structure

Getting Started

Configuration

Usage

Examples

Documentation

Troubleshooting

Roadmap Ideas

Contributors

License

# Features

CSV upload & parsing: Drag‑and‑drop CSVs (up to ~10 MB) to start a session. 
revenue-rescue.vercel.app

Natural-language Q&A: Chat with your data in plain English (and options shown for Hindi/Hinglish). 
revenue-rescue.vercel.app

Instant insights: Quick summaries, trends, and answers with an AI assistant. 
revenue-rescue.vercel.app

Business dashboard: “Business Analysis Dashboard” view that populates after upload / sample data. 
revenue-rescue.vercel.app

Sample dataset to try the experience without uploading your own. 
revenue-rescue.vercel.app

Deployed on Vercel; repo auto-synced from v0.app (per repo overview). 
GitHub

# Tech Stack

Framework: Next.js (TypeScript, App Router indicated by /app), CSS. 
GitHub

Deployment: Vercel (live demo domain). 
GitHub

Language: Mostly TypeScript (~97%). 
GitHub

AI layer: The live app markets “advanced AI” chat; exact provider isn’t declared in the repo preview. (Common choices are OpenAI or Vercel AI SDK—confirm in your local code.)

If you confirm which AI SDK/LLM you’re using, I can pin exact dependencies and examples.

# Project Structure

Based on the repository listing: 
GitHub

Revenue-Rescue/
├─ app/              # Next.js App Router routes (e.g., homepage, /chat)
├─ components/       # Reusable UI components
├─ hooks/            # React hooks
├─ lib/              # Utilities, data/AI helpers (inferred)
├─ public/           # Static assets
├─ styles/           # Global and module CSS
├─ package.json      # Scripts & dependencies
├─ next.config.mjs   # Next.js config
├─ tsconfig.json     # TypeScript config
├─ postcss.config.mjs
└─ README.md

# Getting Started

*Prereqs*: Node.js ≥ 18, pnpm or npm, and a modern browser.

1) *Clone*
git clone https://github.com/Keshav1605/Revenue-Rescue.git
cd Revenue-Rescue

2) *Install*
- choose one
pnpm install
- or
npm install

3) *Configure environment*

Create a .env.local in the project root. Common variables you may need (adjust to your actual stack):

- If using OpenAI via Vercel AI SDK or direct:
OPENAI_API_KEY=sk-...

- If using OpenRouter or other providers:
- OPENROUTER_API_KEY=...
- ANTHROPIC_API_KEY=...
- GOOGLE_API_KEY=...

- Optional Next.js / app settings
NEXT_PUBLIC_APP_NAME="Revenue Rescue"
MAX_UPLOAD_MB=10


Not sure which provider is wired up? Open lib/ or any server action in app/ that calls the AI to confirm the env names. I can tailor this once you share those files.

4) Run dev server
pnpm dev
or
npm run dev


Then open http://localhost:3000.

5) Build & start (production)
pnpm build && pnpm start
- or
npm run build && npm run start

# Configuration#

Upload limits: UI mentions support for files up to ~10 MB; if you need more, configure your file handler and Vercel/Next limits accordingly. 
revenue-rescue.vercel.app

Model/provider: Set your API key(s) and model names in .env.local and the AI client (likely in lib/).

Internationalization: The chat page displays language options (English/Hindi/Hinglish). If you want full i18n, wire translations via next-intl or @lingui and reflect in UI. 
revenue-rescue.vercel.app

# Usage

Upload CSV on /chat. 
revenue-rescue.vercel.app

Ask questions in natural language (e.g., “Show monthly revenue trend”, “Top 5 products by sales”). 
revenue-rescue.vercel.app

View insights & dashboard; iterate with follow‑up prompts. 
revenue-rescue.vercel.app

Try sample data if you don’t have a file handy. 
revenue-rescue.vercel.app

Examples

Sales trend prompt

Calculate monthly revenue for the last 12 months and show the top 3 growth months.


Customer analysis

Group customers by segment and summarize average order value and churn risk by segment.


Inventory

List SKUs with stockouts in the last 30 days and their lost-sales estimates.


Once you confirm the charting library (if any) and response schema, I can add copy‑paste prompt + code examples.

# Documentation

Live App (Marketing & Onboarding): describes value props, workflow, and feature set. 
revenue-rescue.vercel.app

/chat Page: shows the actual upload & chat interface and language selector. 
revenue-rescue.vercel.app

Repo Overview: indicates auto‑sync with v0.app and Vercel deployment hooks. 
GitHub

# Troubleshooting

Nothing happens after upload
Check browser console for parsing errors; verify CSV is < configured size and is valid UTF‑8.

AI replies fail / 401
Ensure correct API key(s) in .env.local and that server functions read them.

Vercel build errors
Confirm Node version ≥ 18 in project settings and engines (if present). Clear both pnpm-lock.yaml and package-lock.json conflicts by using one package manager consistently.

CORS or file-size issues
If using API routes or server actions, bump body size limit in Next config or route handler.

# Roadmap Ideas

From the site’s “Future of Data Analysis” section:

Interactive charts with live‑updating visuals.

Advanced analytics (predictive modeling).

Enterprise integrations (DBs, APIs, business tools). 
revenue-rescue.vercel.app

Additional suggestions:

Dataset schema detection & automatic semantic types.

Privacy mode (on‑device or ephemeral processing).

Saved analyses & shareable reports.

# Contributors

@Keshav1605 — Maintainer. (Repo owner) 
GitHub
@Nishant007 - Designer/Developer

# License

No license file is present in the repository listing; by default, all rights are reserved unless a license is added. Consider adding MIT or another OSI‑approved license to enable open‑source use. 
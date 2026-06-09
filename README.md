# Tover — Digital Market Research Agent

An AI agent that researches high-opportunity website niches and produces structured, developer-ready reports.

## What It Does

The agent autonomously:

1. Decomposes your research request into search angles
2. Searches the web and analyses keyword/trend data
3. Researches competitor landscapes and monetization precedents
4. Verifies key claims across multiple sources
5. Synthesizes everything into a **10-section structured report** ready for a developer to act on

### Report Sections

| # | Section | What it answers |
|---|---------|----------------|
| 1 | Website Concept | What to build |
| 2 | Target Audience | Who it's for and what they search |
| 3 | Market Demand | Search volumes, forum signals, trend data |
| 4 | Competition Analysis | Top 3 competitors + gaps |
| 5 | Monetization Strategy | Revenue streams + realistic estimates |
| 6 | Recommended Tech Stack | Platform/framework choices |
| 7 | Content/Feature Plan | 10 launch-critical pages or features |
| 8 | SEO Opportunity Score | 1–10 with justification |
| 9 | Urgency Flag | BUILD_NOW / EVERGREEN / MONITOR |
| 10 | Handoff Summary | 3–5 sentence brief for the developer |

## Setup

```bash
npm install
```

Set your API keys in a `.env` file or export them:

```bash
# Required
export ANTHROPIC_API_KEY=sk-ant-...

# Optional — enables live search/keyword data
export BRAVE_SEARCH_API_KEY=...   # Brave Search API (web search)
export AHREFS_API_KEY=...          # Ahrefs API (keyword data)
export SERPAPI_KEY=...             # SerpAPI (Google Trends)
```

## Usage

```bash
npm run research
```

Or with a custom prompt:

```bash
npx tsx src/index.ts "Find me a micro-SaaS opportunity in the legal industry"
```

## Architecture

```
src/
├── index.ts          # CLI entry point
├── agent.ts          # Agentic loop (tool use + message history)
├── tools.ts          # Tool definitions (Anthropic tool schema format)
└── tool_handlers.ts  # Tool execution handlers (wire to real APIs here)
```

Open `src/tool_handlers.ts` to wire in real APIs. Brave Search is already integrated — just set `BRAVE_SEARCH_API_KEY`. Without keys, tools return structured stubs so the agent still runs.

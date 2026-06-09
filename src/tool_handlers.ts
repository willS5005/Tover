export type ToolInput = Record<string, unknown>;

export async function handleToolCall(toolName: string, input: ToolInput): Promise<string> {
  switch (toolName) {
    case "web_search": return webSearch(input.query as string);
    case "analyze_keyword": return analyzeKeyword(input.keyword as string, input.context as string | undefined);
    case "competitor_analysis": return competitorAnalysis(input.niche as string, input.competitor_urls as string[] | undefined);
    case "monetization_research": return monetizationResearch(input.niche as string, input.site_type as string);
    case "trend_analysis": return trendAnalysis(input.topic as string, (input.timeframe as string) ?? "12_months");
    case "generate_report": return generateReport(input);
    default: return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

async function webSearch(query: string): Promise<string> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
        headers: { "X-Subscription-Token": apiKey, Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as { web?: { results?: { title: string; url: string; description: string }[] } };
        return JSON.stringify((data.web?.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.description })));
      }
    } catch { /* fall through to stub */ }
  }
  return JSON.stringify({ stub: true, query, note: "Set BRAVE_SEARCH_API_KEY to enable live web search.", results: [{ title: `Search: ${query}`, snippet: "Configure a search API key to retrieve live results." }] });
}

async function analyzeKeyword(keyword: string, context?: string): Promise<string> {
  const ahrefsKey = process.env.AHREFS_API_KEY;
  if (ahrefsKey) {
    try {
      const res = await fetch(`https://api.ahrefs.com/v3/keywords-explorer/overview?select=keyword,volume,difficulty,cpc,traffic_potential&country=us&keywords=${encodeURIComponent(keyword)}`, {
        headers: { Authorization: `Bearer ${ahrefsKey}` },
      });
      if (res.ok) return JSON.stringify(await res.json());
    } catch { /* fall through to stub */ }
  }
  return JSON.stringify({ stub: true, keyword, context, note: "Set AHREFS_API_KEY for live keyword data.", estimated_data: { monthly_searches: "requires API key", keyword_difficulty: "requires API key", cpc_usd: "requires API key", traffic_potential: "requires API key" } });
}

async function competitorAnalysis(niche: string, competitorUrls?: string[]): Promise<string> {
  return JSON.stringify({ stub: true, niche, competitor_urls: competitorUrls ?? [], note: "Set AHREFS_API_KEY to pull live competitor data via Ahrefs Site Explorer." });
}

async function monetizationResearch(niche: string, siteType: string): Promise<string> {
  return JSON.stringify({ stub: true, niche, site_type: siteType, note: "Agent synthesizes monetization data from web_search results and training knowledge." });
}

async function trendAnalysis(topic: string, timeframe: string): Promise<string> {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey) {
    try {
      const res = await fetch(`https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(topic)}&data_type=TIMESERIES&api_key=${serpApiKey}`);
      if (res.ok) return JSON.stringify(await res.json());
    } catch { /* fall through to stub */ }
  }
  return JSON.stringify({ stub: true, topic, timeframe, note: "Set SERPAPI_KEY to enable live Google Trends data." });
}

function generateReport(input: ToolInput): string {
  const features = (input.content_feature_plan as string[]) ?? [];
  const sources = (input.sources as string[]) ?? [];
  const urgencyEmoji: Record<string, string> = { BUILD_NOW: "🔴", EVERGREEN: "🟢", MONITOR: "🟡" };
  const flag = input.urgency_flag as string;
  return [
    "# Market Research Report",
    "",
    "## 1. WEBSITE CONCEPT", String(input.website_concept),
    "",
    "## 2. TARGET AUDIENCE", String(input.target_audience),
    "",
    "## 3. MARKET DEMAND", String(input.market_demand),
    "",
    "## 4. COMPETITION ANALYSIS", String(input.competition_analysis),
    "",
    "## 5. MONETIZATION STRATEGY", String(input.monetization_strategy),
    "",
    "## 6. RECOMMENDED TECH STACK", String(input.tech_stack),
    "",
    "## 7. CONTENT / FEATURE PLAN (Launch-Critical)",
    ...features.map((f, i) => `${i + 1}. ${f}`),
    "",
    `## 8. SEO OPPORTUNITY SCORE: ${input.seo_score}/10`, String(input.seo_justification),
    "",
    `## 9. URGENCY FLAG: ${urgencyEmoji[flag] ?? ""} ${flag}`, String(input.urgency_reason),
    "",
    "## 10. HANDOFF SUMMARY (→ Developer)", String(input.handoff_summary),
    "",
    "---",
    ...(sources.length > 0 ? ["### Sources", ...sources.map((s) => `- ${s}`)] : []),
  ].join("\n").trim();
}

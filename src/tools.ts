import Anthropic from "@anthropic-ai/sdk";

export const tools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description: "Search the web for current market data, keyword volumes, trends, competitor information, and industry news. Use multiple targeted queries to triangulate facts.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "The search query to execute" },
      },
      required: ["query"],
    },
  },
  {
    name: "analyze_keyword",
    description: "Analyze a keyword or niche topic for search demand, competition level, CPC, and monetization signals.",
    input_schema: {
      type: "object" as const,
      properties: {
        keyword: { type: "string", description: "The keyword or niche topic to analyze" },
        context: { type: "string", description: "Optional context about the niche being researched" },
      },
      required: ["keyword"],
    },
  },
  {
    name: "competitor_analysis",
    description: "Research the top competitors in a niche. Returns their strengths, weaknesses, estimated traffic, and the gaps they leave open.",
    input_schema: {
      type: "object" as const,
      properties: {
        niche: { type: "string", description: "The niche or market segment to analyze" },
        competitor_urls: { type: "array", items: { type: "string" }, description: "Optional list of known competitor URLs" },
      },
      required: ["niche"],
    },
  },
  {
    name: "monetization_research",
    description: "Research monetization strategies, commission rates, and realistic revenue estimates for a given niche.",
    input_schema: {
      type: "object" as const,
      properties: {
        niche: { type: "string", description: "The niche to research monetization for" },
        site_type: {
          type: "string",
          enum: ["affiliate_site", "saas_tool", "niche_blog", "directory", "ai_tool", "lead_gen"],
          description: "The type of website/business model",
        },
      },
      required: ["niche", "site_type"],
    },
  },
  {
    name: "trend_analysis",
    description: "Analyze Google Trends data, social media buzz, and forum activity to gauge momentum and urgency for a niche.",
    input_schema: {
      type: "object" as const,
      properties: {
        topic: { type: "string", description: "The topic or niche to analyze for trend momentum" },
        timeframe: {
          type: "string",
          enum: ["3_months", "12_months", "5_years"],
          description: "The trend timeframe to evaluate",
          default: "12_months",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "generate_report",
    description: "Compile all gathered research into the final structured 10-section markdown report. Call this ONLY after sufficient data has been gathered.",
    input_schema: {
      type: "object" as const,
      properties: {
        website_concept: { type: "string", description: "Clear description of the website type and concept" },
        target_audience: { type: "string", description: "Demographics, pain points, and search behaviour" },
        market_demand: { type: "string", description: "Evidence of demand with data points" },
        competition_analysis: { type: "string", description: "Saturation level, top 3 competitors, and identified gaps" },
        monetization_strategy: { type: "string", description: "Revenue streams with realistic estimates" },
        tech_stack: { type: "string", description: "Recommended platform and framework" },
        content_feature_plan: { type: "array", items: { type: "string" }, description: "List of 10 most important launch pages or features" },
        seo_score: { type: "number", minimum: 1, maximum: 10, description: "SEO opportunity score 1-10" },
        seo_justification: { type: "string", description: "Brief justification for the SEO score" },
        urgency_flag: {
          type: "string",
          enum: ["BUILD_NOW", "EVERGREEN", "MONITOR"],
          description: "BUILD_NOW = trending window, EVERGREEN = stable long-term, MONITOR = emerging but not ready",
        },
        urgency_reason: { type: "string", description: "Explanation for the urgency classification" },
        handoff_summary: { type: "string", description: "3-5 sentence brief written directly to the developer" },
        sources: { type: "array", items: { type: "string" }, description: "Source URLs or references used" },
      },
      required: [
        "website_concept", "target_audience", "market_demand", "competition_analysis",
        "monetization_strategy", "tech_stack", "content_feature_plan", "seo_score",
        "seo_justification", "urgency_flag", "urgency_reason", "handoff_summary",
      ],
    },
  },
];

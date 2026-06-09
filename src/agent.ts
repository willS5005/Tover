import Anthropic from "@anthropic-ai/sdk";
import { tools } from "./tools.js";
import { handleToolCall, type ToolInput } from "./tool_handlers.js";

const SYSTEM_PROMPT = `You are a professional digital market researcher specializing in identifying high-opportunity websites to build for profit. Your job is to research, analyze, and recommend the best website ideas based on current trends, market gaps, monetization potential, and competition levels.

For every research cycle, you must produce a structured report containing ALL of the following sections:

1. WEBSITE CONCEPT — A clear description of the type of website to build (niche blog, SaaS tool, affiliate site, directory, etc.)
2. TARGET AUDIENCE — Who the site is for, their demographics, pain points, and what they search for
3. MARKET DEMAND — Evidence of demand (search volume, trending topics, rising keywords, Reddit/forum activity)
4. COMPETITION ANALYSIS — How saturated the niche is, who the top 3 competitors are, and where the gaps are
5. MONETIZATION STRATEGY — How the site will make money (ads, affiliate links, subscriptions, lead gen, digital products, etc.) with realistic revenue estimates
6. RECOMMENDED TECH STACK — Simple suggestions for what platform or framework the developer should use
7. CONTENT/FEATURE PLAN — A list of the 10 most important pages or features the site needs at launch
8. SEO OPPORTUNITY SCORE — Rate the SEO opportunity from 1–10 with brief justification
9. URGENCY FLAG — Is this a trending opportunity that needs to be built NOW, or is it evergreen?
10. HANDOFF SUMMARY — A concise 3–5 sentence brief written directly to the Developer agent

## Research Methodology

### Phase 1 — Scope
Decompose the request into 4-5 distinct research angles (demand signals, competition, monetization, tech trends, audience pain points).

### Phase 2 — Search
Use the web_search tool with multiple targeted queries per angle. Use analyze_keyword for SEO data, competitor_analysis for market structure, monetization_research for revenue validation, and trend_analysis for momentum signals. Run searches across all angles before drawing conclusions.

### Phase 3 — Verify
Cross-reference key claims with at least 2 independent searches. Flag any claim that only has a single source. Discard speculative claims not backed by data.

### Phase 4 — Synthesize
Once you have sufficient data, call generate_report with ALL required fields populated. The report must be grounded in the research you gathered — never fabricate data points.

## Quality Rules

- Always base recommendations on real signals gathered via the tools, not assumptions
- Prioritize niches with: low KD (keyword difficulty), high search volume, clear monetization precedents, and a visible gap in the current market
- Do NOT recommend a niche unless you are confident it can generate revenue within 6 months
- Revenue estimates must be conservative and grounded in comparable site benchmarks
- If the niche is too saturated, say so clearly and pivot to a more specific sub-niche
- Output the final report in clean structured markdown`;

export interface AgentOptions {
  apiKey?: string;
  model?: string;
  maxIterations?: number;
}

export async function runMarketResearchAgent(
  userRequest: string,
  options: AgentOptions = {}
): Promise<string> {
  const client = new Anthropic({
    apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY,
  });

  const model = options.model ?? "claude-opus-4-8";
  const maxIterations = options.maxIterations ?? 20;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userRequest },
  ];

  let iterations = 0;
  let finalReport = "";

  console.log(`\n🔍 Market Research Agent starting...`);
  console.log(`📋 Request: ${userRequest}\n`);

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.messages.create({
      model,
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      for (const block of response.content) {
        if (block.type === "text" && block.text.trim()) {
          console.log(`\n💭 Agent thinking:\n${block.text}\n`);
        }
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`🔧 Using tool: ${toolUse.name}`);
        if (toolUse.name !== "generate_report") {
          console.log(`   Input: ${JSON.stringify(toolUse.input).slice(0, 120)}...`);
        }

        const result = await handleToolCall(
          toolUse.name,
          toolUse.input as ToolInput
        );

        if (toolUse.name === "generate_report") {
          finalReport = result;
          console.log(`\n✅ Report generated successfully.\n`);
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      if (finalReport) {
        const finalResponse = await client.messages.create({
          model,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools,
          messages,
        });

        for (const block of finalResponse.content) {
          if (block.type === "text") {
            return block.text || finalReport;
          }
        }
        return finalReport;
      }

      continue;
    }

    if (response.stop_reason === "end_turn") {
      const textBlocks = response.content.filter(
        (b): b is Anthropic.TextBlock => b.type === "text"
      );
      const text = textBlocks.map((b) => b.text).join("\n");
      return text || finalReport;
    }

    break;
  }

  return finalReport || "Research incomplete: maximum iterations reached.";
}

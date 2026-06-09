import { runMarketResearchAgent } from "./agent.js";

const userRequest =
  process.argv[2] ??
  `Research and identify the single highest-opportunity website niche to build for profit right now in 2025-2026.
   Focus on low competition, high demand, and clear monetization within 6 months.
   Consider SaaS tools, AI-powered tools, affiliate sites, and niche directories.
   Produce the full 10-section structured report.`;

runMarketResearchAgent(userRequest)
  .then((report) => {
    console.log("\n" + "=".repeat(80));
    console.log("MARKET RESEARCH REPORT");
    console.log("=".repeat(80) + "\n");
    console.log(report);
  })
  .catch((err) => {
    console.error("Agent error:", err);
    process.exit(1);
  });

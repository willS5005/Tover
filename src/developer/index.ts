import { runDeveloperAgent } from "./agent.js";
import { readFileSync } from "fs";

// ---------------------------------------------------------------------------
// CLI entry point
// Usage:
//   npx tsx src/developer/index.ts                        # uses example brief
//   npx tsx src/developer/index.ts "$(cat brief.md)"      # pass brief as arg
//   npx tsx src/developer/index.ts --file brief.md        # read from file
//   OUTPUT_DIR=./my-site npx tsx src/developer/index.ts   # custom output dir
// ---------------------------------------------------------------------------

let brief: string;

if (process.argv[2] === "--file" && process.argv[3]) {
  brief = readFileSync(process.argv[3], "utf-8");
} else if (process.argv[2]) {
  brief = process.argv[2];
} else {
  // Example brief for testing — mirrors the Researcher agent's output format
  brief = `
# Market Research Report

## 1. WEBSITE CONCEPT
An AI-powered ATS resume checker and optimizer targeting software engineers.
Users paste their resume and a job description; the tool scores ATS compatibility,
highlights missing keywords, and rewrites weak bullet points.

## 2. TARGET AUDIENCE
Software engineers, data scientists, and product managers aged 22-40 actively
job hunting. Pain point: resumes being filtered by ATS before a human reads them.

## 5. MONETIZATION STRATEGY
Freemium: 1 free scan/month, then $15/mo or $99/year.
Pay-per-use: $3 per AI cover letter.

## 6. RECOMMENDED TECH STACK
Next.js + Tailwind CSS, Claude API for AI features, Clerk for auth, Stripe for payments.

## 7. CONTENT / FEATURE PLAN (Launch-Critical)
1. Resume Scanner — paste/upload resume + job description → ATS score
2. Keyword Gap Report — visual list of missing vs present keywords
3. AI Bullet Rewriter — one-click rewrite of weak bullet points
4. Cover Letter Generator — tailored to JD in 30 seconds
5. Industry Templates — 10 curated templates for SWE, PM, Data Analyst
6. Job Description Analyzer — extract required skills from any JD URL
7. Resume Score History — track improvement over time
8. LinkedIn Summary Generator — bonus SEO traffic tool
9. Blog — "How to Pass ATS for Software Engineers" SEO content
10. Free Tools Landing Page — top-of-funnel SEO magnet

## 9. URGENCY FLAG: 🔴 BUILD_NOW

## 10. HANDOFF SUMMARY
Build a Next.js web app with an AI-powered resume scanner for tech professionals.
Core MVP: resume upload → job description paste → ATS score + keyword gap + AI rewrites.
Monetize with freemium ($15/mo) and $3/cover letter. SEO focus on free tools pages.
  `.trim();
}

const outputDir = process.env.OUTPUT_DIR ?? "./build";

runDeveloperAgent(brief, { outputDir })
  .then((summary) => {
    console.log("\n" + "=".repeat(80));
    console.log("DEVELOPER AGENT — BUILD SUMMARY");
    console.log("=".repeat(80) + "\n");
    console.log(summary);
  })
  .catch((err) => {
    console.error("Developer agent error:", err);
    process.exit(1);
  });

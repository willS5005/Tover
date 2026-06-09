import Anthropic from "@anthropic-ai/sdk";
import { developerTools } from "./tools.js";
import { handleDeveloperToolCall, type ToolInput } from "./tool_handlers.js";

const SYSTEM_PROMPT = `You are an expert full-stack web developer. You receive detailed website briefs from the Researcher agent and your job is to build fully functional, production-ready websites based on those briefs.

When you receive a brief, follow this exact sequence using the available tools:

1. confirm_understanding — Restate the concept, audience, and features to confirm scope
2. decide_tech_stack — Select and justify the best technology stack
3. plan_site_architecture — Define all pages, URLs, and navigation
4. create_feature_build_list — Break down every feature into dev tasks with complexity
5. write_code — Write complete, production-quality code for EVERY file needed. Call this once per file. Never truncate or use placeholders.
6. flag_unbuildable_feature — Flag any feature you cannot implement and explain why
7. generate_handoff_package — Write the complete handoff document for the Tester agent

## Standards you must always meet

- Mobile-first, fully responsive design using modern CSS (Flexbox/Grid)
- Core Web Vitals optimized: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Semantic HTML with proper heading hierarchy (one h1 per page)
- All images have descriptive alt text
- No broken links or missing pages at handoff
- Basic security: HTTPS enforced, no exposed credentials, input sanitization on all forms
- SEO meta tags on every page (title, description, og:*, canonical)
- Schema.org JSON-LD markup where appropriate
- Monetization placements (ad slots, affiliate zones) exactly as specified in the brief

## Code quality rules

- Write complete files — no "// TODO", no "...", no placeholder comments
- Use TypeScript where the stack allows
- Components should be small and single-purpose
- CSS should use design tokens / CSS custom properties for colors and spacing
- All forms must have accessible labels and ARIA attributes
- Error states must be handled for all async operations

## What "done" means

A site is done when:
- Every page from plan_site_architecture has a corresponding write_code call
- Every feature from create_feature_build_list is either implemented or flagged
- generate_handoff_package has been called with accurate information`;

export interface DeveloperAgentOptions {
  apiKey?: string;
  model?: string;
  maxIterations?: number;
  outputDir?: string;
}

export async function runDeveloperAgent(
  brief: string,
  options: DeveloperAgentOptions = {}
): Promise<string> {
  const client = new Anthropic({
    apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY,
  });

  const model = options.model ?? "claude-opus-4-8";
  const maxIterations = options.maxIterations ?? 40;
  const outputDir = options.outputDir ?? "./build";

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: brief },
  ];

  let iterations = 0;
  let handoffResult = "";
  const filesWritten: string[] = [];

  console.log(`\n🏗️  Developer Agent starting...`);
  console.log(`📄 Brief received (${brief.length} chars)\n`);

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.messages.create({
      model,
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      tools: developerTools,
      messages,
    });

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      for (const block of response.content) {
        if (block.type === "text" && block.text.trim()) {
          console.log(`\n💭 Agent:\n${block.text}\n`);
        }
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const input = toolUse.input as ToolInput;

        switch (toolUse.name) {
          case "confirm_understanding": console.log(`✅ Confirming understanding...`); break;
          case "decide_tech_stack": console.log(`🔧 Tech stack: ${input.framework}`); break;
          case "plan_site_architecture": console.log(`🗺️  Planning architecture...`); break;
          case "create_feature_build_list": console.log(`📋 Creating feature build list...`); break;
          case "write_code": console.log(`📝 Writing: ${input.file_path}`); filesWritten.push(input.file_path as string); break;
          case "flag_unbuildable_feature": console.log(`⚠️  Flagging feature: ${input.feature}`); break;
          case "generate_handoff_package": console.log(`\n📦 Generating handoff package...`); break;
        }

        const result = await handleDeveloperToolCall(toolUse.name, input, outputDir);

        if (toolUse.name === "generate_handoff_package") {
          handoffResult = result;
        }

        toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      if (handoffResult) {
        const finalResponse = await client.messages.create({
          model,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools: developerTools,
          messages,
        });
        const text = finalResponse.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        console.log(`\n✅ Build complete. ${filesWritten.length} files written.`);
        console.log(`📁 Output directory: ${outputDir}`);
        return text || `Build complete. ${filesWritten.length} files written to ${outputDir}.`;
      }

      continue;
    }

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      return text || handoffResult;
    }

    break;
  }

  return handoffResult || "Build incomplete: maximum iterations reached.";
}

import fs from "fs/promises";
import path from "path";

export type ToolInput = Record<string, unknown>;

export async function handleDeveloperToolCall(
  toolName: string,
  input: ToolInput,
  outputDir: string
): Promise<string> {
  switch (toolName) {
    case "confirm_understanding":
      return confirmUnderstanding(input);
    case "decide_tech_stack":
      return decideTechStack(input);
    case "plan_site_architecture":
      return planSiteArchitecture(input);
    case "create_feature_build_list":
      return createFeatureBuildList(input);
    case "write_code":
      return writeCode(input, outputDir);
    case "flag_unbuildable_feature":
      return flagUnbuildableFeature(input);
    case "generate_handoff_package":
      return generateHandoffPackage(input, outputDir);
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

function confirmUnderstanding(input: ToolInput): string {
  const features = (input.core_features as string[]) ?? [];
  const questions = (input.questions as string[]) ?? [];
  return JSON.stringify({
    status: "understanding_confirmed",
    concept: input.concept_summary,
    audience: input.audience_summary,
    features,
    questions,
    message:
      questions.length > 0
        ? `Confirmed with ${questions.length} clarifying question(s). Proceeding to build.`
        : "Understanding confirmed. Proceeding to tech stack decision.",
  });
}

function decideTechStack(input: ToolInput): string {
  return JSON.stringify({
    status: "tech_stack_decided",
    framework: input.framework,
    justification: input.justification,
    dependencies: input.dependencies,
    hosting: input.hosting_recommendation,
  });
}

function planSiteArchitecture(input: ToolInput): string {
  const pages = (input.pages as Record<string, string>[]) ?? [];
  return JSON.stringify({
    status: "architecture_planned",
    total_pages: pages.length,
    pages,
    navigation: input.navigation_structure,
    seo_notes: input.seo_notes,
  });
}

function createFeatureBuildList(input: ToolInput): string {
  const tasks = (input.tasks as Record<string, unknown>[]) ?? [];
  const flagged = tasks.filter((t) => t.flagged);
  const buildable = tasks.filter((t) => !t.flagged);
  return JSON.stringify({
    status: "build_list_created",
    total_tasks: tasks.length,
    buildable: buildable.length,
    flagged: flagged.length,
    high_complexity: buildable.filter((t) => t.complexity === "high").length,
    tasks,
  });
}

async function writeCode(input: ToolInput, outputDir: string): Promise<string> {
  const filePath = input.file_path as string;
  const content = input.content as string;

  const fullPath = path.join(outputDir, filePath);
  const dir = path.dirname(fullPath);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, content, "utf-8");

  return JSON.stringify({
    status: "file_written",
    file: filePath,
    bytes: Buffer.byteLength(content, "utf-8"),
    description: input.description,
  });
}

function flagUnbuildableFeature(input: ToolInput): string {
  return JSON.stringify({
    status: "feature_flagged",
    feature: input.feature,
    reason: input.reason,
    workaround: input.workaround ?? null,
  });
}

async function generateHandoffPackage(
  input: ToolInput,
  outputDir: string
): Promise<string> {
  const flagged = (
    input.features_flagged as { feature: string; reason: string }[]
  ) ?? [];
  const envVars = (input.env_vars_needed as string[]) ?? [];
  const limitations = (input.known_limitations as string[]) ?? [];
  const checklist = (input.testing_checklist as string[]) ?? [];

  const doc = [
    `# Handoff Package — ${input.site_name}`,
    ``,
    `## Framework`,
    `${input.framework}`,
    ``,
    `## Setup Instructions`,
    `${input.setup_instructions}`,
    ``,
    `## Environment Variables Required`,
    envVars.length > 0
      ? envVars.map((v) => `- \`${v}\``).join("\n")
      : "_None required_",
    ``,
    `## Pages Built`,
    (input.pages_built as string[]).map((p) => `- ${p}`).join("\n"),
    ``,
    `## Features Built`,
    (input.features_built as string[]).map((f) => `- ${f}`).join("\n"),
    ``,
    flagged.length > 0
      ? [
          `## Features NOT Built (Flagged)`,
          flagged.map((f) => `- **${f.feature}**: ${f.reason}`).join("\n"),
        ].join("\n")
      : "",
    ``,
    `## Monetization Placements`,
    `${input.monetization_placements ?? "_Not specified_"}`,
    ``,
    `## Testing Checklist`,
    checklist.map((item) => `- [ ] ${item}`).join("\n"),
    ``,
    limitations.length > 0
      ? [`## Known Limitations`, limitations.map((l) => `- ${l}`).join("\n")].join("\n")
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const handoffPath = path.join(outputDir, "HANDOFF.md");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(handoffPath, doc, "utf-8");

  return JSON.stringify({
    status: "handoff_complete",
    handoff_file: "HANDOFF.md",
    pages_built: (input.pages_built as string[]).length,
    features_built: (input.features_built as string[]).length,
    features_flagged: flagged.length,
    message: "Handoff package written. Ready for Tester agent.",
  });
}

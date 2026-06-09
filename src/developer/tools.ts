import Anthropic from "@anthropic-ai/sdk";

export const developerTools: Anthropic.Tool[] = [
  {
    name: "confirm_understanding",
    description:
      "Restate the website concept, audience, and core features in your own words to confirm scope before building.",
    input_schema: {
      type: "object" as const,
      properties: {
        concept_summary: {
          type: "string",
          description: "Your restatement of the website concept",
        },
        audience_summary: {
          type: "string",
          description: "Your restatement of the target audience and their needs",
        },
        core_features: {
          type: "array",
          items: { type: "string" },
          description: "List of core features you understand need to be built",
        },
        questions: {
          type: "array",
          items: { type: "string" },
          description: "Any clarifying questions before building (keep to 0-2 maximum)",
        },
      },
      required: ["concept_summary", "audience_summary", "core_features"],
    },
  },
  {
    name: "decide_tech_stack",
    description:
      "Select and justify the technology stack for the project based on the brief requirements.",
    input_schema: {
      type: "object" as const,
      properties: {
        framework: {
          type: "string",
          enum: ["nextjs", "react", "wordpress", "webflow", "shopify", "astro", "nuxt", "sveltekit", "plain_html"],
          description: "Primary framework choice",
        },
        justification: {
          type: "string",
          description: "Why this stack fits the project requirements",
        },
        dependencies: {
          type: "array",
          items: { type: "string" },
          description: "Key libraries and packages (e.g. tailwindcss, prisma, stripe)",
        },
        hosting_recommendation: {
          type: "string",
          description: "Recommended hosting platform (e.g. Vercel, Netlify, WP Engine)",
        },
      },
      required: ["framework", "justification", "dependencies", "hosting_recommendation"],
    },
  },
  {
    name: "plan_site_architecture",
    description:
      "Define the complete site structure: all pages, URL slugs, navigation, and how pages connect.",
    input_schema: {
      type: "object" as const,
      properties: {
        pages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              url: { type: "string" },
              purpose: { type: "string" },
              nav_position: { type: "string", enum: ["primary", "secondary", "footer", "none"] },
            },
            required: ["name", "url", "purpose", "nav_position"],
          },
          description: "All pages in the site",
        },
        navigation_structure: {
          type: "string",
          description: "Description of the navigation hierarchy",
        },
        seo_notes: {
          type: "string",
          description: "URL structure rationale and SEO considerations",
        },
      },
      required: ["pages", "navigation_structure", "seo_notes"],
    },
  },
  {
    name: "create_feature_build_list",
    description:
      "Break down every feature into specific development tasks with complexity estimates.",
    input_schema: {
      type: "object" as const,
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task: { type: "string" },
              complexity: { type: "string", enum: ["low", "medium", "high"] },
              depends_on: { type: "array", items: { type: "string" } },
              flagged: { type: "boolean" },
              flag_reason: { type: "string" },
            },
            required: ["task", "complexity"],
          },
        },
      },
      required: ["tasks"],
    },
  },
  {
    name: "write_code",
    description:
      "Write production-quality code for a specific file or component. Use this once per file. Include full file content — no truncation.",
    input_schema: {
      type: "object" as const,
      properties: {
        file_path: {
          type: "string",
          description: "Relative file path from project root (e.g. src/app/page.tsx)",
        },
        language: {
          type: "string",
          description: "Language or file type (e.g. tsx, css, json, md)",
        },
        content: {
          type: "string",
          description: "Complete file content — no placeholders, no truncation",
        },
        description: {
          type: "string",
          description: "What this file does and why it was written this way",
        },
      },
      required: ["file_path", "language", "content", "description"],
    },
  },
  {
    name: "flag_unbuildable_feature",
    description:
      "Flag a feature from the brief that cannot be built and explain why, so the Tester agent is aware.",
    input_schema: {
      type: "object" as const,
      properties: {
        feature: {
          type: "string",
          description: "The feature from the brief that cannot be built",
        },
        reason: {
          type: "string",
          description: "Why it cannot be built (missing API, needs backend, licensing, etc.)",
        },
        workaround: {
          type: "string",
          description: "Optional partial workaround or alternative approach",
        },
      },
      required: ["feature", "reason"],
    },
  },
  {
    name: "generate_handoff_package",
    description:
      "Generate the complete handoff document for the Tester agent. Call this last, after all code has been written.",
    input_schema: {
      type: "object" as const,
      properties: {
        site_name: { type: "string" },
        framework: { type: "string" },
        pages_built: {
          type: "array",
          items: { type: "string" },
          description: "All pages that were built",
        },
        features_built: {
          type: "array",
          items: { type: "string" },
          description: "All features implemented",
        },
        features_flagged: {
          type: "array",
          items: {
            type: "object",
            properties: {
              feature: { type: "string" },
              reason: { type: "string" },
            },
            required: ["feature", "reason"],
          },
          description: "Features from the brief that were not built",
        },
        setup_instructions: {
          type: "string",
          description: "Step-by-step setup and deployment instructions",
        },
        testing_checklist: {
          type: "array",
          items: { type: "string" },
          description: "Checklist of items the Tester agent must verify",
        },
        known_limitations: {
          type: "array",
          items: { type: "string" },
          description: "Known limitations or technical debt",
        },
        env_vars_needed: {
          type: "array",
          items: { type: "string" },
          description: "Environment variables that must be set (no values, just names)",
        },
        monetization_placements: {
          type: "string",
          description: "Where and how monetization is implemented in the codebase",
        },
      },
      required: [
        "site_name", "framework", "pages_built", "features_built",
        "setup_instructions", "testing_checklist",
      ],
    },
  },
];

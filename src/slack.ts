import { App, LogLevel } from "@slack/bolt";
import { runMarketResearchAgent } from "./agent.js";
import { runDeveloperAgent } from "./developer/agent.js";

// ---------------------------------------------------------------------------
// Slack Bot — Research → Build Pipeline
//
// Commands:
//   /research <topic>   Run the Researcher agent; posts report to the channel
//   /build <brief>      Run the Developer agent on a brief; posts summary
//   /pipeline <topic>   Run both agents end-to-end and post all outputs
//
// Socket Mode is used so no public URL is required (ideal for local/dev).
// Set SLACK_APP_TOKEN (xapp-...) in addition to the bot/signing tokens.
// ---------------------------------------------------------------------------

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.WARN,
});

// ── /research <topic> ──────────────────────────────────────────────────────

app.command("/research", async ({ command, ack, respond, client }) => {
  await ack();

  const topic = command.text.trim();
  if (!topic) {
    await respond("Usage: `/research <topic>`");
    return;
  }

  await respond(`🔍 Researcher agent starting on: *${topic}*…`);

  try {
    const report = await runMarketResearchAgent(topic);

    // Slack has a 3000-char limit per block; chunk if needed
    const chunks = splitIntoChunks(report, 2900);

    await client.chat.postMessage({
      channel: command.channel_id,
      text: `📊 Research Report — ${topic}`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: `📊 Research Report` } },
        ...chunks.map((chunk) => ({
          type: "section" as const,
          text: { type: "mrkdwn" as const, text: chunk },
        })),
      ],
    });
  } catch (err) {
    await respond(`❌ Researcher agent failed: ${(err as Error).message}`);
  }
});

// ── /build <brief> ─────────────────────────────────────────────────────────

app.command("/build", async ({ command, ack, respond, client }) => {
  await ack();

  const brief = command.text.trim();
  if (!brief) {
    await respond("Usage: `/build <brief text or paste a report here>`");
    return;
  }

  await respond(`🏗️ Developer agent starting…`);

  try {
    const summary = await runDeveloperAgent(brief, {
      outputDir: `./build/${Date.now()}`,
    });

    await client.chat.postMessage({
      channel: command.channel_id,
      text: `✅ Build Complete`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: `✅ Build Complete` } },
        ...splitIntoChunks(summary, 2900).map((chunk) => ({
          type: "section" as const,
          text: { type: "mrkdwn" as const, text: chunk },
        })),
      ],
    });
  } catch (err) {
    await respond(`❌ Developer agent failed: ${(err as Error).message}`);
  }
});

// ── /pipeline <topic> ──────────────────────────────────────────────────────
// Runs both agents end-to-end: Researcher → Developer

app.command("/pipeline", async ({ command, ack, respond, client }) => {
  await ack();

  const topic = command.text.trim();
  if (!topic) {
    await respond("Usage: `/pipeline <topic>`");
    return;
  }

  const channelId = command.channel_id;

  // Step 1 — Research
  await respond(`🔍 *Pipeline started for:* ${topic}\n_Step 1/2: Researcher agent running…_`);

  let report: string;
  try {
    report = await runMarketResearchAgent(topic);
  } catch (err) {
    await respond(`❌ Researcher agent failed: ${(err as Error).message}`);
    return;
  }

  // Post the research report
  await client.chat.postMessage({
    channel: channelId,
    text: `📊 Research complete — handing off to Developer agent…`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: `📊 Research Report — ${topic}` } },
      ...splitIntoChunks(report, 2900).map((chunk) => ({
        type: "section" as const,
        text: { type: "mrkdwn" as const, text: chunk },
      })),
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: "_Passing report to Developer agent…_" }],
      },
    ],
  });

  // Step 2 — Build
  let buildSummary: string;
  try {
    buildSummary = await runDeveloperAgent(report, {
      outputDir: `./build/${slugify(topic)}-${Date.now()}`,
    });
  } catch (err) {
    await client.chat.postMessage({
      channel: channelId,
      text: `❌ Developer agent failed: ${(err as Error).message}`,
    });
    return;
  }

  await client.chat.postMessage({
    channel: channelId,
    text: `✅ Pipeline complete — ${topic}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: `✅ Build Complete — ${topic}` } },
      ...splitIntoChunks(buildSummary, 2900).map((chunk) => ({
        type: "section" as const,
        text: { type: "mrkdwn" as const, text: chunk },
      })),
    ],
  });
});

// ── Helpers ────────────────────────────────────────────────────────────────

function splitIntoChunks(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLen));
    start += maxLen;
  }
  return chunks;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}

// ── Start ──────────────────────────────────────────────────────────────────

(async () => {
  await app.start();
  console.log("⚡ Tover Slack bot running in Socket Mode");
  console.log("Commands: /research  /build  /pipeline");
})();

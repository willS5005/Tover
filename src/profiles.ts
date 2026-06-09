// Individual Slack bot profiles for each Tover agent.
// icon_url uses GitHub's identicon service to give each bot a unique avatar
// without requiring any hosted assets.

export interface BotProfile {
  username: string;
  icon_url: string;
  description: string;
}

export const RESEARCHER_PROFILE: BotProfile = {
  username: "Tover Researcher",
  icon_url: "https://github.com/identicons/tover-researcher",
  description:
    "Market research agent — discovers high-opportunity website niches, analyses demand and competition, and hands structured reports to the Builder.",
};

export const BUILDER_PROFILE: BotProfile = {
  username: "Tover Builder",
  icon_url: "https://github.com/identicons/tover-builder",
  description:
    "Developer agent — receives research briefs and produces production-ready websites, choosing tech stacks, writing code, and generating handoff packages.",
};

/** Returns only the fields accepted by chat.postMessage for display overrides. */
export function slackDisplayProfile(profile: BotProfile) {
  return { username: profile.username, icon_url: profile.icon_url };
}

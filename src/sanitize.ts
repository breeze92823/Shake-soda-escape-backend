import {
  CURRENCY_MAX, REBIRTH_MAX, LEVEL_MAX, RECORD_MAX, SODA_IDS, AURA_IDS, PASS_IDS, WORLD_IDS,
  DAILY_DAY_MAX, BOOST_MAX_AHEAD_MS, CLOCK_SLACK_MS, TUTORIAL_DONE_STEP,
} from "./constants.js";
import type { PlayerDoc } from "./db.js";

export function finite(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
export function clampNum(v: number, max: number): number {
  return Math.min(max, Math.max(0, v));
}
export function clampInt(v: number, max: number, min = 0): number {
  return Math.min(max, Math.max(min, Math.floor(v)));
}
function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// Known ids only, no duplicates (owned sodas / auras / passes).
export function sanitizeIds(raw: unknown, known: readonly string[]): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id): id is string => typeof id === "string" && known.includes(id)))];
}

// The game is client-authoritative -- no server-side gameplay validation. What IS enforced:
// shape and bounds, so a malformed payload can never corrupt this player's own Mongo document.
// A forged number can only ever affect the sender's own save and their leaderboard rows.
export function sanitizeProgress(raw: unknown): Partial<PlayerDoc> | null {
  if (!isObject(raw)) return null;
  const out: Partial<PlayerDoc> = {};

  for (const key of ["soda", "wins", "xp", "xpNext"] as const) {
    if (finite(raw[key])) out[key] = clampNum(raw[key] as number, CURRENCY_MAX);
  }
  if (finite(raw.level)) out.level = clampInt(raw.level, LEVEL_MAX, 1);
  if (finite(raw.rebirths)) out.rebirths = clampInt(raw.rebirths, REBIRTH_MAX);
  if (finite(raw.record)) out.record = clampInt(raw.record, RECORD_MAX);
  if (typeof raw.equipped === "string" && SODA_IDS.includes(raw.equipped)) out.equipped = raw.equipped;
  if (raw.owned !== undefined) out.owned = sanitizeIds(raw.owned, SODA_IDS);
  if (raw.passes !== undefined) out.passes = sanitizeIds(raw.passes, PASS_IDS);
  if (raw.auras !== undefined) out.auras = sanitizeIds(raw.auras, AURA_IDS);
  if (raw.worlds !== undefined) out.worlds = sanitizeIds(raw.worlds, WORLD_IDS);
  if (raw.aura === null) out.aura = null;
  else if (typeof raw.aura === "string" && AURA_IDS.includes(raw.aura)) out.aura = raw.aura;
  if (finite(raw.sodaBoostUntil)) out.sodaBoostUntil = clampInt(raw.sodaBoostUntil, Date.now() + BOOST_MAX_AHEAD_MS);
  if (finite(raw.dailyDay)) out.dailyDay = clampInt(raw.dailyDay, DAILY_DAY_MAX);
  if (finite(raw.dailyClaimedAt)) out.dailyClaimedAt = clampInt(raw.dailyClaimedAt, Date.now() + CLOCK_SLACK_MS);
  if (finite(raw.tutorialStep)) out.tutorialStep = clampInt(raw.tutorialStep, TUTORIAL_DONE_STEP);
  return out;
}

// What loadProgress sends down as tutorialStep: a doc that predates the tutorial belongs to a player who
// was never shown it, so it reads as finished. New accounts get a doc with an explicit step (WorldRoom.ts
// persistAvatar) or no doc at all (noProgress -> client starts at 0).
export function resolveTutorialStep(doc: Partial<PlayerDoc>): number {
  return finite(doc.tutorialStep) ? clampInt(doc.tutorialStep, TUTORIAL_DONE_STEP) : TUTORIAL_DONE_STEP;
}

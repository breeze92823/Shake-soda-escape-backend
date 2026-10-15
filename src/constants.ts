// Keep in step with the client's src/config.js by hand.
export const ROOM_MAX_CLIENTS = 50;

// Where a player appears for everyone else before their first `pose` arrives (client SPAWN).
export const SPAWN = { x: 0, y: 0.3, z: 0 };

// Walkable bounds (client WORLD_BOUNDS = the lobby ARENA, x -26..26, z -36..22), with a little slack
// and headroom for the Soda Jump launch (client LAUNCH.maxHeight = 700 m): a forged pose cannot put
// a player outside the world for everyone else to see.
export const WORLD_BOUNDS = { minX: -28, maxX: 28, minZ: -38, maxZ: 24, minY: -40, maxY: 800 };

// Longest accepted strings.
export const NAME_MAX = 64;
export const POSE_MAX = 32;
// Bloxity avatar JSON, relayed as-is. Kept under the 4 KB cap of the join request's options.
export const AVATAR_MAX_LEN = 3000;

// Colyseus drops the whole connection for a WebSocket message above this (default 4 KB).
export const MAX_PAYLOAD_BYTES = 128 * 1024;

// Leaderboards: how often WorldRoom re-queries Mongo for the all-time top players per stat, how
// many rows it fetches per stat before merging with the live roster, and how many it sends.
export const LEADERBOARD_REFRESH_MS = 15_000;
export const LEADERBOARD_QUERY_LIMIT = 20;
export const LEADERBOARD_ROWS = 8; // the in-world boards (client lobby.js) show 8 rows

// How long a dropped connection (WiFi blip, backgrounded tab) may reconnect with the same session.
export const RECONNECT_SECONDS = 20;

// Upper bounds for saved values, so a forged payload cannot push a bogus number onto the
// leaderboards. Generous ceilings, not game rules.
export const CURRENCY_MAX = 1_000_000_000_000_000_000; // soda, wins, xp
export const REBIRTH_MAX = 1_000_000;
export const LEVEL_MAX = 1_000_000;
export const RECORD_MAX = 1_000_000; // best launch altitude in studs (client SPACE.summit = 20000)

// Client config.js ids: SODA_ITEMS (front + back) + VOID_SODA, AURAS and BOOST_PASSES.
export const SODA_IDS: readonly string[] = [
  "cola", "orange", "lemon", "lime", "ufo", "cherry", "slush", "strawberry", "cream", "galaxy", "rainbow", "trophy", "void",
  // Client WORLD_SODAS: three per themed world.
  "candy-1", "candy-2", "candy-3", "neon-1", "neon-2", "neon-3", "glacier-1", "glacier-2", "glacier-3",
  "volcano-1", "volcano-2", "volcano-3", "reef-1", "reef-2", "reef-3",
];
export const DEFAULT_SODA = "cola";
export const AURA_IDS: readonly string[] = ["diamond", "emerald", "ruby", "rainbow", "golden", "void", "fire", "galaxy"];
export const PASS_IDS: readonly string[] = ["soda", "wins"];
// Client config.js WORLDS: the lobby plus the worlds behind each Summit (unlocked ones are saved).
export const WORLD_IDS: readonly string[] = ["lobby", "candy", "neon", "glacier", "volcano", "reef"];

// Daily rewards (client config.js DAILY): a 7-day cycle. `dailyClaimedAt` is an epoch-ms stamp that can
// never be in the future (beyond clock slack); the x2 Soda boost (client state.sodaBoostUntil) expires at an
// epoch-ms stamp at most BOOST_MAX_AHEAD_MS from now.
export const DAILY_DAY_MAX = 6; // the client stores the NEXT day to claim, 0..6
export const BOOST_MAX_AHEAD_MS = 24 * 60 * 60 * 1000;
export const CLOCK_SLACK_MS = 10 * 60 * 1000;

// The client's per-browser fallback id for players who are not signed in to Bloxity.
// Guests are never persisted.
export const GUEST_ID_PREFIX = "guest-";

# Shake Soda Escape — server

Colyseus server for the `Shake-soda-escape` client: progress saving, multiplayer presence
(poses, Bloxity avatars, held sodas, auras) and the two lobby leaderboards. Same stack and Bloxity
Legion deploy flow as `Clean-leaves-for-loot-backend`.

```
npm install
npm start        # tsx watch, ws://localhost:2567 (playground + /monitor in dev), GET /health
npm test         # mocha integration tests with an in-memory fake Mongo collection
npm run build    # -> build/, run with `node build/index.js` (see Dockerfile)
```

Config (all optional locally, see `.env.example`): `MONGODB_URI` (without it nothing persists),
`CLIENT_ORIGIN`, `PORT`.

## Protocol

Room: `world` (`joinOrCreate("world", { userId, username, avatar })`), up to 50 players per room;
extra players get a new room. `userId` is the Bloxity id; ids starting `guest-` are never saved.

| Client → server | Purpose |
| --- | --- |
| `pose` | `x y z yaw speed01 grounded pose` (~15 Hz) |
| `setAvatar` | Bloxity avatar JSON |
| `setEquipped` / `setAura` | equipped soda id / aura id (`""` = no aura) |
| `saveProgress` | the persisted `state.js` keys, debounced (sanitized, upserted in Mongo) |
| `identify` | `{ userId, username }` after a sign-in / sign-out; answered with `progress` / `noProgress` |

| Server → client | Purpose |
| --- | --- |
| `progress` | the saved document + `serverTime` (hydrates `state`) |
| `noProgress` | new account, guest, or no Mongo — keep the local state (and push it); carries `serverTime` |
| `serverError` | the saved document could not be read; the client must not overwrite it |
| `leaderboard` | `{ soda, rebirths }`, rows `{ id, name, value }`, top 8 (#1 row also carries `avatar`) |

Persisted keys (`src/sanitize.ts`): `soda wins level xp xpNext rebirths equipped owned passes record
sodaBoostUntil auras aura worlds dailyDay dailyClaimedAt`. Room state (`WorldState.players`) syncs pose,
equipped soda, aura, avatar, name and the leaderboard stats (`soda rebirths`).

The game is client-authoritative: the server only enforces shape and bounds on saves. The id lists
and caps in `src/constants.ts` (`SODA_IDS`, `AURA_IDS`, `PASS_IDS`, `WORLD_IDS`, `SPAWN`, `WORLD_BOUNDS`) must be
kept in step with the client's `src/config.js` by hand.

## Deploy

`.github/workflows/deploy.yml`: pull requests run build + tests; pushes to `dev` deploy the dev
channel and `main` the prod channel on Bloxity Legion (image pushed to GHCR).

GitHub settings (Settings → Secrets and variables → Actions):

| Name | Kind | Value |
| --- | --- | --- |
| `LEGION_GAME_ID` | repo **variable** (a secret also works) | the lowercase game id from the Bloxity "My Games" dashboard = the client's `GAME_SLUG`, `shake-soda-escape` |
| `LEGION_DEPLOY_TOKEN` | repo **secret** | the deploy token from the same dashboard |

`GITHUB_TOKEN` (used to push the image to GHCR) is provided automatically; the workflow requests
`packages: write` itself. `MONGODB_URI`, `CLIENT_ORIGIN` and `PORT` are injected by Legion at runtime,
not set in GitHub.

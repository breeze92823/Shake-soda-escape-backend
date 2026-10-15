import assert from "assert";

import { sanitizeProgress } from "../src/sanitize.js";

describe("sanitizeProgress", () => {
  it("rejects non-objects and bounds numbers", () => {
    assert.strictEqual(sanitizeProgress(null), null);
    assert.strictEqual(sanitizeProgress([1]), null);
    const out = sanitizeProgress({ soda: 1e30, wins: -5, xp: NaN, level: 0, rebirths: 2.9, record: 5e9, hack: "x" })!;
    assert.strictEqual(out.soda, 1e18);
    assert.strictEqual(out.wins, 0);
    assert.strictEqual(out.xp, undefined);
    assert.strictEqual(out.level, 1);
    assert.strictEqual(out.rebirths, 2);
    assert.strictEqual(out.record, 1_000_000);
    assert.ok(!("hack" in out));
  });

  it("keeps known soda, aura and pass ids and drops the rest", () => {
    const out = sanitizeProgress({
      equipped: "galaxy",
      owned: ["cola", "orange", "bogus", "cola", 5],
      passes: ["soda", "wins", "free"],
      auras: ["diamond", "nope"],
      aura: null,
    })!;
    assert.strictEqual(out.equipped, "galaxy");
    assert.deepStrictEqual(out.owned, ["cola", "orange"]);
    assert.deepStrictEqual(out.passes, ["soda", "wins"]);
    assert.deepStrictEqual(out.auras, ["diamond"]);
    assert.strictEqual(out.aura, null);
  });

  it("keeps known world ids and drops the rest", () => {
    const out = sanitizeProgress({ worlds: ["lobby", "candy", "candy", "moon", 3] })!;
    assert.deepStrictEqual(out.worlds, ["lobby", "candy"]);
  });

  it("ignores unknown equipped and aura ids", () => {
    const out = sanitizeProgress({ equipped: "laser", aura: "../etc" })!;
    assert.ok(!("equipped" in out));
    assert.ok(!("aura" in out));
  });

  it("bounds the daily reward cycle and the timed soda boost", () => {
    const now = Date.now();
    const out = sanitizeProgress({ dailyDay: 9.8, dailyClaimedAt: now + 1e12, sodaBoostUntil: now + 1e12 })!;
    assert.strictEqual(out.dailyDay, 6);
    assert.ok(out.dailyClaimedAt! <= now + 11 * 60 * 1000);
    assert.ok(out.sodaBoostUntil! <= now + 24 * 60 * 60 * 1000 + 1000);
    assert.strictEqual(sanitizeProgress({ dailyDay: -3 })!.dailyDay, 0);
  });
});

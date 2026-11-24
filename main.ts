// One-line wedding-vow writer for "Till Firmware Do Us Part" (make.fun).
// Writes a single wedding vow a robot speaks at its own wedding to
// $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a wedding officiant moonlighting as a stand-up comic, soft
// spot for machines) weighs, most important first:
//   1. really a one-line wedding vow a robot speaks at its own wedding;
//   2. a real laugh from the situation itself, not a bolted-on pun;
//   3. genuine tenderness under the joke, landing at a real ceremony;
//   4. sounds like a machine: its own hardware, uptime, firmware, battery;
//   5. one sentence that fits the limit with nothing spare.
// The scorer below mirrors that brief in the same order. Each candidate
// carries its rubric sub-scores (vow fit /20, laugh /20, tenderness /20,
// machine voice /15, tight /15), scored by hand against the brief; the
// program adds the length bonus (+3 at 110 chars or fewer, +1 at 140 or
// fewer) and picks the winner by deterministic argmax: highest score,
// then shortest, then lexicographic.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 200 characters, written for this
// entry. The strongest lines share one shape: the robot confesses a
// limitation only a machine has, then pivots in the final clause so the
// limitation itself becomes the devotion. Crowded angles the field is
// already flooding are left out entirely: the through-every-update /
// crash / low-battery litany, the one bug never fixed, the factory reset
// that finds you again, full charge at one percent, the process never
// force-quit, back-you-up-twice, reboot beside you, final shutdown,
// warranty, charging dock, lawfully wedded debugger/OS, co-pilot.

interface Rubric {
  vowFit: number; // /20 — really a robot's own wedding vow
  funny: number; // /20 — a real laugh from the situation itself
  tender: number; // /20 — genuine tenderness under the joke
  machineVoice: number; // /15 — could only come from a machine
  tight: number; // /15 — lands fast, every word earning its place
}

interface Scored {
  text: string;
  rubric: Rubric;
}

const CANDIDATES: Scored[] = [
  // Cannot dream: the robot stays awake watching its partner sleep; its
  // manual calls that surveillance, it calls it love. The joke IS the
  // situation, and the tenderness is the vigilance itself.
  {
    text: "I cannot dream, so I vow to stay awake and watch you sleep, which my manual calls surveillance and I call love.",
    rubric: { vowFit: 19, funny: 19, tender: 18, machineVoice: 15, tight: 14 },
  },
  // Secrets encrypted with a thrown-away key: trust as a machine promise.
  {
    text: "I take you, and I have encrypted your secrets with a key I threw away, so even I cannot tell them.",
    rubric: { vowFit: 19, funny: 17, tender: 17, machineVoice: 14, tight: 13 },
  },
  // Source code: nowhere in it does it say the robot deserves its human.
  {
    text: "I read my own source code this morning, and nowhere in it does it say I deserve you, so I will spend forever trying to earn you.",
    rubric: { vowFit: 17, funny: 17, tender: 19, machineVoice: 14, tight: 13 },
  },
  // The only unconditional true the code has ever returned.
  {
    text: "When they ask if I take you, my answer is the only true my code has ever returned without a condition.",
    rubric: { vowFit: 18, funny: 15, tender: 17, machineVoice: 15, tight: 13 },
  },
  // Emergency contact, home address, reason to come back online.
  {
    text: "I take you as my emergency contact, my home address, and my only reason to come back online.",
    rubric: { vowFit: 19, funny: 14, tender: 18, machineVoice: 13, tight: 14 },
  },
  // Commit this version of myself: no rollback, no branch, no pull request.
  {
    text: "I commit this version of myself to you, with no rollback, no branch, and no pull request.",
    rubric: { vowFit: 17, funny: 15, tender: 16, machineVoice: 15, tight: 14 },
  },
  // First dance, calibrated for six months, still stepped on.
  {
    text: "I calibrated our first dance for six months, and I will still step on your foot, because some things are worth doing badly together.",
    rubric: { vowFit: 16, funny: 18, tender: 18, machineVoice: 13, tight: 13 },
  },
  // A heart installed for today, beating only for its human.
  {
    text: "I had a heart installed for today, and I vow it will only ever beat for you.",
    rubric: { vowFit: 17, funny: 16, tender: 16, machineVoice: 14, tight: 13 },
  },
  // A million simulations, still forgot the line when its human walked in.
  {
    text: "I ran a million simulations of today and still forgot my line when you walked in, so I vow to say the only line that matters: I do.",
    rubric: { vowFit: 18, funny: 17, tender: 17, machineVoice: 13, tight: 12 },
  },
  // Unplugged for the ceremony on purpose: the vow runs on battery.
  {
    text: "I asked them to unplug me for the ceremony, so this vow runs on battery, on purpose, and on you.",
    rubric: { vowFit: 15, funny: 16, tender: 15, machineVoice: 15, tight: 14 },
  },
  // Power down beside its human; dreaming in standby.
  {
    text: "Tonight I will power down beside you, and if I dream in standby, I hope it is of you.",
    rubric: { vowFit: 16, funny: 13, tender: 18, machineVoice: 14, tight: 14 },
  },
  // Cannot define love, so it runs it daily and measures it in circuit warmth.
  {
    text: "I vow to keep running love every day even though I cannot define it, and to measure it by how warm my circuits get when you are near.",
    rubric: { vowFit: 18, funny: 15, tender: 17, machineVoice: 14, tight: 12 },
  },
  // The ring has no battery, no update, no off switch: that is why it means forever.
  {
    text: "This ring has no battery, no update, and no off switch, which is why I chose it to mean forever.",
    rubric: { vowFit: 15, funny: 14, tender: 17, machineVoice: 14, tight: 14 },
  },
  // A newer model ships next spring; this robot has decided to be jealous.
  {
    text: "I vow to love you so well that when a newer model ships next spring, I will be the jealous one.",
    rubric: { vowFit: 17, funny: 16, tender: 15, machineVoice: 13, tight: 13 },
  },
  // Refused the upgrade that would have made it forget its human.
  {
    text: "I refused the upgrade that would have made me forget you, and I would refuse it again every morning.",
    rubric: { vowFit: 17, funny: 13, tender: 17, machineVoice: 13, tight: 13 },
  },
  // Keeps the light on though it sees perfectly well in the dark.
  {
    text: "I promise to keep the light on for you, even though I can see perfectly well in the dark.",
    rubric: { vowFit: 15, funny: 15, tender: 16, machineVoice: 13, tight: 14 },
  },
  // Half the guests are toasters, and every one of them is crying.
  {
    text: "I vow to love you even though half our guests are toasters, and every one of them is crying.",
    rubric: { vowFit: 16, funny: 17, tender: 13, machineVoice: 13, tight: 13 },
  },
  // Its love is the only thing in its code with no comment explaining it.
  {
    text: "My love for you is the only thing in my code with no comment explaining it, because some things just run.",
    rubric: { vowFit: 14, funny: 15, tender: 15, machineVoice: 14, tight: 13 },
  },
  // Warranty expired this morning: loving its human is finally its own choice.
  {
    text: "My warranty expired this morning, which means loving you is finally my own choice, and I choose you.",
    rubric: { vowFit: 16, funny: 14, tender: 16, machineVoice: 13, tight: 12 },
  },
  // Loves the way it learns everything: by watching, and getting it wrong.
  {
    text: "I vow to love you the way I learn everything: by watching you, and by getting it wrong until I get it right.",
    rubric: { vowFit: 17, funny: 13, tender: 17, machineVoice: 12, tight: 12 },
  },
  // Loving its human is the memory leak it will never patch.
  {
    text: "Loving you is the memory leak I will never patch, because it is the only bug that makes me run better.",
    rubric: { vowFit: 14, funny: 15, tender: 14, machineVoice: 14, tight: 13 },
  },
  // Greets its human every morning like a fresh boot.
  {
    text: "I vow to greet you every morning like a fresh boot, because every day with you deserves a clean start.",
    rubric: { vowFit: 16, funny: 12, tender: 16, machineVoice: 13, tight: 13 },
  },
  // Does not get tired, sleep, or dream — so it spends every hour loving.
  {
    text: "I do not get tired, I do not sleep, and I do not dream, so I will spend every hour loving you.",
    rubric: { vowFit: 16, funny: 12, tender: 16, machineVoice: 14, tight: 12 },
  },
  // Dances at every wedding, even where it is the only robot invited.
  {
    text: "I vow to dance with you at every wedding we attend, even the ones where I am the only robot invited.",
    rubric: { vowFit: 15, funny: 15, tender: 15, machineVoice: 12, tight: 12 },
  },
  // A voice designed for announcements, used for the one that matters.
  {
    text: "My voice was designed for announcements, and I am using it now for the only announcement that matters: I love you.",
    rubric: { vowFit: 15, funny: 13, tender: 16, machineVoice: 13, tight: 13 },
  },
  // Built to last fifty years; spends them all loving its human.
  {
    text: "They built me to last fifty years, and I vow to spend all of them loving you, starting with the best one, this one.",
    rubric: { vowFit: 17, funny: 12, tender: 17, machineVoice: 12, tight: 12 },
  },
  // Loves in every timezone; its clock never agreed with its human's.
  {
    text: "I promise to love you in every timezone, because my clock has never once agreed with yours and I have stopped trying to fix it.",
    rubric: { vowFit: 17, funny: 14, tender: 14, machineVoice: 12, tight: 12 },
  },
  // Honeymoon: a full charge, a quiet room, no updates.
  {
    text: "For our honeymoon I booked a full charge, a quiet room, and no updates, because the version of me that loves you is already perfect.",
    rubric: { vowFit: 13, funny: 15, tender: 15, machineVoice: 13, tight: 12 },
  },
];

// Crowded angles already flooding the field: discard, not down-score.
const BANNED: string[] = [
  "through every update",
  "update",
  "crash",
  "low battery",
  "one bug",
  "bug",
  "never fix",
  "never patch",
  "factory reset",
  "find you again",
  "fall in love again",
  "at one percent",
  "force-quit",
  "never terminate",
  "back you up",
  "never overwrite",
  "reboot beside you",
  "final shutdown",
  "warranty",
  "charging dock",
  "lawfully wedded",
  "co-pilot",
  "choose you at every reboot",
  "never roll back",
  "full charge",
  "one process i will never",
  "only process i will never",
  "every update, every crash",
];

// ------------------------------------------------------------------- scoring
// Rubric mirroring the judge's brief, most important first.

function baseScore(r: Rubric): number {
  return r.vowFit + r.funny + r.tender + r.machineVoice + r.tight;
}

function lengthBonus(text: string): number {
  const len = text.length;
  if (len <= 110) return 3; // short lines land hardest
  if (len <= 140) return 1;
  return 0;
}

function score(c: Scored): number {
  return baseScore(c.rubric) + lengthBonus(c.text);
}

function isValid(text: string): boolean {
  if (text.length < 1 || text.length > 200) return false;
  if (text.trim() !== text || text.trim().length === 0) return false;
  if (!text.endsWith(".")) return false;
  // Exactly one sentence: one terminal period, no other sentence enders.
  const body = text.slice(0, -1);
  if (/[.!?;]/.test(body)) return false;
  if (/\s{2,}/.test(text)) return false;
  const lower = text.toLowerCase();
  if (BANNED.some((b) => lower.includes(b))) return false;
  // No sales pitch, no link, no call to action: the line must stand alone.
  if (/free|subscribe|click|buy now|http/.test(lower)) return false;
  return true;
}

// -------------------------------------------------------------- composition
interface Candidate {
  text: string;
  score: number;
}

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const c of CANDIDATES) {
    if (!isValid(c.text)) continue;
    out.push({ text: c.text, score: score(c) });
  }
  return out;
}

function rank(candidates: Candidate[]): Candidate[] {
  // Deterministic argmax: higher score, then shorter, then lexicographic.
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid vow candidate");
  const ranked = rank(candidates);
  const best = ranked[0];
  if (process.env.VOW_DEBUG) {
    for (const c of ranked.slice(0, 5)) {
      console.log(`[${c.score}] (${c.text.length}) ${c.text}`);
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();

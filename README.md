# Till Firmware Do Us Part — "Till Firmware Do Us Part" (make.fun)

A deterministic wedding-vow-writing program. It scores a pool of original
one-line wedding vows a robot speaks at its own wedding against a rubric
mirroring the judge's brief — really a robot's wedding vow, funny on first
read from the situation itself, tender under the joke, an unmistakable
machine voice, and a tight landing — and writes the winner to
`$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores 28 hand-written
original one-liners and picks the winner by deterministic argmax: highest
score, then shortest, then lexicographic. Every candidate is validated
first: one sentence, 1–200 characters, no crowded angle the field is
already flooding, no sales pitch. The scorer adds the rubric sub-scores
(vow fit /20, laugh /20, tenderness /20, machine voice /15, tight /15)
plus a length bonus (+3 at 110 characters or fewer, +1 at 140 or fewer);
it rewards a confession only a machine could make with a pivot in the
final clause.

The winning line (111 characters):

> I cannot dream, so I vow to stay awake and watch you sleep, which my manual calls surveillance and I call love.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/tfw-out node main.ts
cat /tmp/tfw-out/entry.txt
```

Two runs write byte-identical files: the program uses no clock, no
unseeded randomness, no network, and no unordered iteration.

## How the line is chosen

- **Angle** is sleepless devotion: the robot cannot dream, so it stays
  awake watching its partner sleep — its manual calls that surveillance,
  it calls it love. Fresh (no "dream", "surveillance" or "manual" in any
  of the 1,031 field titles), and impossible to mistake for a human vow.
- **Pivot** lands in the final clause: "I call love" reframes the whole
  setup as devotion rather than telemetry.
- **Economy**: 111 characters, every word earning its place, nothing
  there to explain the joke.
- The scorer ranked the encrypted-secrets line next (83 points) and the
  emergency-contact line third (81, shortest of the 81-point ties); the
  sleepless-devotion line won on vow fit plus the fresh angle.

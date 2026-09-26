---
type: Ad-hoc Record
---

# Ad-hoc Work Record: download-intent-studio

> **Type**: quick-task
> **Created**: 2026-09-26
> **Branch**: feat/download-intent-studio
> **Backlog**: none (intent-studio initiative 0048, packet 7)
> **Status**: shipped to the branch — not merged, not deployed

## Current Behavior

The site links to the hosted Intent Studio but offers no download, and the pricing page's
*Start free* buttons open the app without saying which plan was chosen.

## Expected Behavior

- A `/download` page, as the owner approved on the review canvas
  (https://claude.ai/artifact/46EKfMEooQQT9k2SvgMvhW, heading "Download Intent Studio"):
  *Download for Mac* (Apple silicon) → the app's own `/download` page; *Or use it in your
  browser*; macOS **Available**, Windows and Linux **Coming soon**. The lead says what the app
  is in plain words (the owner asked for "a normal way… legitimate"): *The Intent Studio app for
  Mac: the same workspace you use in the browser, in its own window. It can also work with
  folders on your Mac — only the ones you choose.*
- *Download* in the nav and the phone menu, *Download Intent Studio* in the footer, and a line
  under the Intent Studio hero.
- The pricing page is unchanged (the owner, 2026-09-26: "do not change anything on the
  pricing… three plans, let it be as it is").

## Decisions

- **"Coming soon" is said, in one place.** The build banned the phrase as a hard constraint, and
  the pricing page once chose a specific reason over it. The owner asked for exactly these words
  for the platforms the app is not yet built for (2026-09-26, initiative 0048 D5) and approved
  the design with them. The build now strips only a `site-platform__status` chip reading exactly
  "Coming soon" before checking; anywhere else the phrase still fails the build.
- **The link never names a version.** It goes to the app's `/download`, which reads the release
  the cloud serves — so a new release needs no change here.

## Unchanged Behavior

Every other page's copy; the copy rules everywhere outside the download page's status chips;
no external requests beyond the existing app link.

## Verification Evidence

- `node build.mjs`: "copy rules: clean · nothing renders unresolved".
- The narrowed rule, checked on four cases: the status chip passes; "coming soon" in a sentence,
  in a chip without the status class, and "Coming soon to Linux" in a status chip all still fail.
- Walked `/download/` at 1280 (dark) and 320 (light and dark): no sideways scroll, the three
  platforms stack; `/intent-studio/` shows the new line; `src/pages/pricing.html` is identical
  to `main` (only the shared nav gains *Download*).

## Waits on the owner

Merging and deploying. **Deploy only after release 0.6.5 is on production** — the app's public
`/download` page arrives with it (production runs 0.6.4).

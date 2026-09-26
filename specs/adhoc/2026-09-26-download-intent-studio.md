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
  browser*; macOS **Available**, Windows and Linux **Coming soon**.
- *Download* in the nav and the phone menu, *Download Intent Studio* in the footer, and a line
  under the Intent Studio hero.
- *Start free* on Starter and Team opens `…/signup?plan=starter|team`, so the new organization
  starts on that plan (frontend phase 106, backend phase 168).

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
  platforms stack; `/intent-studio/` shows the new line; the built pricing page links
  `…/signup?plan=starter` and `…/signup?plan=team`.

## Waits on the owner

Merging and deploying. **Deploy only after release 0.6.5 is on production** — the app's public
`/download` page arrives with it (production runs 0.6.4), and `?plan=` is read from phase 106.

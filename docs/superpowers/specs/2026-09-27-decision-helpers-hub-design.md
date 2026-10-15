# Decision Helpers Hub — Design

**Date:** 2026-09-27
**Status:** Approved, building.

## Goal

Turn the single-tool site (`decidehowtodecide.org`) into a small **hub of decision
helpers**. The existing "Decision-Method Selector" is the primary/highest-order
helper (*who should decide, and how*). Add a second, domain-specific helper —
the **Agency Design Canvas** (*workflow vs AI vs agent, and how much autonomy*),
already built and tested under `Temp/agency-design-canvas/` — re-skinned to match
the primary tool's look and feel. A new landing page signposts between them.

## Entry structure (decided with user)

Landing becomes the site root; the current tool moves to a sub-URL.

```
index.html            → NEW landing page (menu)          decidehowtodecide.org/
method-selector.html  → current tool, moved verbatim      /method-selector.html
agent-autonomy.html   → canvas, reskinned, single file     /agent-autonomy.html
```

### Why `.html` URLs (not clean `/method-selector`)

CloudFront serves `index.html` as the default root object **and** the 403/404
fallback, over a **private S3 + Origin Access Control** origin. OAC does not do
directory-index resolution for subfolders, so `/method-selector` (extensionless)
or `/method-selector/` would 403 → fall back to the landing page. Clean URLs
would require a CloudFront viewer-request Function. Using `.html` extensions
needs **zero infra change** and matches the existing one-file-per-page pattern.
The 403/404 → `index.html` fallback now lands mistyped URLs on the menu, which is
acceptable ("lost? here's the menu").

## Pages

### `index.html` — landing / hub
- Built in the primary tool's exact design language: IBM Plex Sans/Mono, warm
  palette tokens (`--ink`, `--paper`, `--clay`, `--green`, ...), mono uppercase
  eyebrow, `.card` system, `.wrap` max-width, shared shadow/radius.
- Header eyebrow + h1 + one-line sub.
- **Extensible card grid** of helpers. Each card: title, one-line summary,
  "what it answers", CTA link. Two cards now (Method Selector flagged primary;
  Agency Canvas). Adding a third later is just another card — no relayout.
- Matching footer.

### `method-selector.html` — the current tool
- Content moved **verbatim** from the old `index.html`.
- Only change: a small "← Decision helpers" back-link to `/`.

### `agent-autonomy.html` — the canvas, re-skinned
- The three canvas files (`index.html` + `styles.css` + `app.js`) inlined into
  **one self-contained HTML file**, matching the primary tool's single-file
  architecture (keeps deploy a simple per-file `aws s3 cp`).
- **Decision logic preserved byte-for-byte**: `groups` question data, scoring
  formula, thresholds, oversight/caution rules, JSON export. DESIGN_CONTEXT.md
  explicitly warns against casual threshold changes — this change is
  presentation only.
- Re-themed to the warm IBM Plex palette (header, cards, meters, SVG plot,
  buttons, chips, collapsible `details`) so the two tools read as siblings.
- Same "← Decision helpers" back-link. All content kept (sliders, meters, flow
  strip, glossary, science/misuse/sources, print styles, disclaimers).

## Maintainer docs
- `DESIGN_CONTEXT.md` and the canvas tests move out of `Temp/` into the repo
  (`docs/` and `tests/`). They are **never deployed** — deploy copies only the
  three HTML files. `Temp/` is then removed.

## Verification
- Run the preserved canvas test suite + `node --check` on the extracted logic to
  confirm the reskin did not change behaviour.
- Preview all three pages in the browser at desktop and mobile widths; check
  look, links, responsiveness.
- Do **not** run the AWS deploy (needs the user's SSO session); hand over exact
  commands and update CLAUDE.md's deploy section to cover all three files.

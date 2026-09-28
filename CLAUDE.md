# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small hub of static, client-side "decision helpers" published at `decidehowtodecide.org`. Every deployable page lives under `site/`:

- `site/index.html` — the **landing page**: the "Hold Certainty Lightly / Life Is Full of Sliders" brand homepage (hero, manifesto, phrases, evidence, and a three-card helper grid signposting the helpers). It keeps its own richer cream/teal/rust palette rather than the shared tokens, so it does **not** link `assets/tokens.css`; it shares the site's IBM Plex type system (Plex Sans for display/body, Plex Mono for the uppercase technical labels). Cards 01–03 link to the three live helpers; card 04 is a future helper. The card grid is a flexible `auto-fit` so it balances as helpers are added.
- `site/method-selector.html` — the **Decision-Method Selector** (the primary, highest-order helper): recommends a decision-making method (Autocratic, Delegation, Consultative, Advice, Consent, Democratic, Consensus) from seven tunable dimensions of a decision.
- `site/agent-autonomy.html` — the **Agency Design Canvas** (domain-specific helper): decides whether a task needs a workflow, AI-in-a-workflow, a constrained agent, or a higher-autonomy agent, and how much autonomy is defensible.
- `site/agent-residency-classifier.html` — the **Agent Residency Classifier** (domain-specific helper): a step-by-step wizard that classifies an AI agent into one of six IAM "residency" types by where it runs, then lists its identity/authentication/control requirements, with a reference table, presets and Markdown export.
- `site/assets/tokens.css` — the shared design tokens (`:root` custom properties) linked by the three helper pages.

Each page keeps its own CSS and JS **inline** and loads Google Fonts (IBM Plex Sans / IBM Plex Mono). The three **helper** pages also link `assets/tokens.css` and share the paper/clay/green palette through it; the **landing** page keeps its own cream/teal/rust brand palette inline and does not link `tokens.css`. The whole site shares the IBM Plex type system regardless.

Non-deployable material lives outside `site/`: `docs/` (design rationale and specs — see `docs/agent-autonomy-DESIGN_CONTEXT.md` and `docs/agent-autonomy-SPEC.md`), `tests/`, `package.json`, `deploy.sh`. There is no bundler or framework; editing the HTML in `site/` *is* the development workflow.

## Architecture — Decision-Method Selector (`site/method-selector.html`)

Driven by one `state` object (`{U,R,P,I,K,A,B}`, each 0-100) and a single `render()` call that re-derives everything on every slider/chip change:

- `DIMS` — defines the 7 sliders (key, name, pole labels).
- `TYPES` — preset dimension profiles for the "what are you deciding?" chips (ADR, Policy, Feature, etc.); clicking a chip overwrites `state` with a preset.
- `CENTRAL` — fixed position of each of the 7 methods on the decentralisation spectrum (0-100), used both for the marker/ranking display and as the basis of the recommendation.
- `BLURB`, `TOOLS` — per-method description text and compatible/incompatible decision-rights tools (RACI, RAPID, DACI, DARE) shown in the result panel.
- `demand(state)` — collapses the 7 dimensions into a single weighted "decentralisation demand" score (0-100); the weights are the tuning knobs for how much each dimension matters.
- `domainOf(state)` — separately classifies the decision as Clear/Complicated/Complex/Chaotic (Cynefin-style), used for display and as an input to some override rules.
- `recommend(state)` — picks the nearest method to the `demand()` score by default, then applies a sequence of hand-coded override/escalation rules (e.g. forcing Consensus when irreversibility + interdependence + buy-in are all extreme, routing between Consultative/Consent/Advice/Democratic at various boundary conditions). **These overrides are the actual product logic** — read them in order, since later rules can reclassify what an earlier rule just set.
- `render()` — pure DOM writer; reads `state`, calls the functions above, and repaints the verdict, spectrum marker, ranked list, reasons, and tools panel. Every call rebuilds the relevant `innerHTML`.

When changing the recommendation behavior, the override chain in `recommend()` is the part that needs the most care — small threshold changes can flip results across a wide range of slider combinations, so re-check several `TYPES` presets after editing it.

## Architecture — Agency Design Canvas (`site/agent-autonomy.html`)

A separate single-page tool with its logic inline in the page's `<script>`. It scores five question groups (`groups` object: agency need, AI need, delegation concern, incremental value, control maturity) on 0–4 sliders, plus two hard-gate checkboxes (mandatory approval, missing foundational controls) and an oversight-mode select. `update()` computes a permissible-autonomy ceiling and picks one of four architectures, then layers caution/oversight rules.

**The thresholds and formula are deliberate design heuristics, not validated risk scores — do not change them casually.** The full rationale (why each distinction exists, the autonomy–assurance paradox, guardrails) is in `docs/agent-autonomy-DESIGN_CONTEXT.md`, and requirements in `docs/agent-autonomy-SPEC.md`. Change the logic and the tests together.

## Architecture — Agent Residency Classifier (`site/agent-residency-classifier.html`)

A single-page wizard driven by inline data + a small state machine (all in the page's `<script>`): `TYPES` (the six residency types and their guidance), `QA` (Part 1 branching questions — `classify()` walks them to a type), `QB` (Part 2 identity questions), `PRESETS`, `CASES`, and `flags()` (risk notes derived from the answers). `render()` swaps "screens" (welcome → qa → reveal → qb → results → reference); `markdown()` exports the record.

**Provenance / scrubbing note:** this tool was contributed from an internal (bank) context and was **deliberately genericised for public use** — "the bank" → "your organisation", the "Agentic X" project presets renamed, "our stack" reframed as an illustrative reference stack, all example statuses set to "Illustrative" (the original "In estate/Planned" labels disclosed real deployments), and Gartner report IDs removed in favour of "informed by industry analyst research". The internal enum value is `owner:"internal"` and the per-type stack guidance key is `stack`. **Keep it organisation-neutral** — do not reintroduce a specific organisation's name, real/planned deployment status, or proprietary research IDs, since this page is public.

## Tests

`tests/agent-autonomy.test.cjs` extracts the inline `<script>` from `site/agent-autonomy.html` (so it always tests what actually ships) and exercises the decision logic with a lightweight DOM mock. No dependencies:

```bash
npm test
```

Covers the baseline workflow recommendation, AI-assisted workflow, the higher-autonomy candidate, the approval hard gate, the HOOTL oversight conflict, and the missing-controls autonomy cap. These are logic checks, not browser/accessibility tests.

## Deployment

Deployed manually (no CI/CD) to AWS:

- **S3 bucket:** `decidehowtodecide` (region `eu-west-2`), private, accessible only via CloudFront (Origin Access Control).
- **CloudFront distribution:** `E1CJLNAOY573D`, serving `decidehowtodecide.org` and `www.decidehowtodecide.org` over HTTPS via an ACM certificate. `index.html` is both the default root object and the custom error response for 403/404 — so mistyped URLs fall back to the landing page. **Note:** OAC does not do directory-index resolution for subfolders, which is why sub-pages use `.html` extensions (`/method-selector.html`, `/agent-autonomy.html`) rather than clean URLs.
- **DNS:** managed at Namecheap (`registrar-servers.com` nameservers) — apex is an ALIAS record, `www` a CNAME, both pointing at the CloudFront domain `d26ojh3nj4y00.cloudfront.net`.

To publish, run the deploy script from the repo root:

```bash
./deploy.sh
```

It runs `aws s3 sync site/ s3://decidehowtodecide/ --delete --exclude ".DS_Store"` (mirrors `site/` exactly, so nothing outside `site/` is ever uploaded and stale objects are removed) followed by a CloudFront `/*` invalidation. Requires an active AWS SSO session (`aws sso login`) on the `091844124359` account (the `[default]` profile).

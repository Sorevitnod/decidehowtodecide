# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small hub of static, client-side "decision helpers" published at `decidehowtodecide.org`. Every deployable page lives under `site/`:

- `site/index.html` — the **landing page** / menu that signposts the helpers.
- `site/method-selector.html` — the **Decision-Method Selector** (the primary, highest-order helper): recommends a decision-making method (Autocratic, Delegation, Consultative, Advice, Consent, Democratic, Consensus) from seven tunable dimensions of a decision.
- `site/agent-autonomy.html` — the **Agency Design Canvas** (domain-specific helper): decides whether a task needs a workflow, AI-in-a-workflow, a constrained agent, or a higher-autonomy agent, and how much autonomy is defensible.
- `site/assets/tokens.css` — the shared design tokens (`:root` custom properties) linked by all three pages.

Each page keeps its own CSS and JS **inline** and links two external stylesheets only: Google Fonts (IBM Plex Sans / IBM Plex Mono) and `assets/tokens.css`. The pages share visual identity through `tokens.css`; everything else is per-page.

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

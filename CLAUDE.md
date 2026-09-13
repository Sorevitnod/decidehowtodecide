# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single self-contained static HTML file (`index.html`) — a "Decision-Method Selector" that recommends a decision-making method (Autocratic, Delegation, Consultative, Advice, Consent, Democratic, Consensus) based on seven tunable dimensions of a decision. All CSS and JS are inline in the one file; the only external dependency is a Google Fonts stylesheet (IBM Plex Sans / IBM Plex Mono).

There is no build system, package manager, linter, or test suite — it's plain HTML/CSS/JS meant to be opened directly or served as-is. Editing `index.html` *is* the entire development workflow.

## Architecture (index.html `<script>`)

The whole app is driven by one `state` object (`{U,R,P,I,K,A,B}`, each 0-100) representing the seven dimensions, and a single `render()` call that re-derives everything on every slider/chip change:

- `DIMS` — defines the 7 sliders (key, name, pole labels).
- `TYPES` — preset dimension profiles for the "what are you deciding?" chips (ADR, Policy, Feature, etc.); clicking a chip overwrites `state` with a preset.
- `CENTRAL` — fixed position of each of the 7 methods on the decentralisation spectrum (0-100), used both for the marker/ranking display and as the basis of the recommendation.
- `BLURB`, `TOOLS` — per-method description text and compatible/incompatible decision-rights tools (RACI, RAPID, DACI, DARE) shown in the result panel.
- `demand(state)` — collapses the 7 dimensions into a single weighted "decentralisation demand" score (0-100); the weights are the tuning knobs for how much each dimension matters.
- `domainOf(state)` — separately classifies the decision as Clear/Complicated/Complex/Chaotic (Cynefin-style), used for display and as an input to some override rules.
- `recommend(state)` — picks the nearest method to the `demand()` score by default, then applies a sequence of hand-coded override/escalation rules (e.g. forcing Consensus when irreversibility + interdependence + buy-in are all extreme, routing between Consultative/Consent/Advice/Democratic at various boundary conditions). **These overrides are the actual product logic** — read them in order, since later rules can reclassify what an earlier rule just set.
- `render()` — pure DOM writer; reads `state`, calls the functions above, and repaints the verdict, spectrum marker, ranked list, reasons, and tools panel. No framework, no virtual DOM — every call rebuilds the relevant `innerHTML`.

When changing the recommendation behavior, the override chain in `recommend()` is the part that needs the most care — small threshold changes can flip results across a wide range of slider combinations, so re-check several `TYPES` presets after editing it.

## Deployment

The site is deployed manually (no CI/CD, nothing in this repo drives it) to AWS:

- **S3 bucket:** `decidehowtodecide` (region `eu-west-2`), private, accessible only via CloudFront (Origin Access Control).
- **CloudFront distribution:** `E1CJLNAOY573D`, serving `decidehowtodecide.org` and `www.decidehowtodecide.org` over HTTPS via an ACM certificate. `index.html` is both the default root object and the custom error response for 403/404 (single-page app fallback).
- **DNS:** managed at Namecheap (`registrar-servers.com` nameservers) — apex is an ALIAS record, `www` a CNAME, both pointing at the CloudFront domain `d26ojh3nj4y00.cloudfront.net`.

To publish a change after editing `index.html`:

```bash
aws s3 cp index.html s3://decidehowtodecide/index.html
aws cloudfront create-invalidation --distribution-id E1CJLNAOY573D --paths "/*"
```

Both commands require an active AWS SSO session (`aws sso login`) on the `091844124359` account (the `[default]` profile).

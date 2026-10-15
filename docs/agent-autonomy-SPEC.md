# Agency Design Canvas — Product and Engineering Specification
**Version:** 1.0 | **Baseline:** Version 5 prototype | **Date:** 27 September 2026

## 1. Scope
Create a static browser-based architecture decision aid. Based on sliders and hard governance selections, show: recommended architecture, reasoning, required/permissible autonomy, concern/value/maturity indicators, an autonomy–assurance warning where relevant, and human oversight guidance. Provide transparent expandable glossary, science, methodological limitations, misuse and sources.

Maintain the earlier discussion in `DESIGN_CONTEXT.md` **outside the public page**. Do not publish that file.

## 2. Actors / use cases
- Architect: compare task requirements to workflow/agent options without treating AI capability as automatic justification.
- Risk/security reviewer: identify mismatches between desired authority and tested controls, auditability, impact, reversibility and policies.
- Product/engineering owner: discuss incremental value of independence compared with an AI-assisted workflow.
- Workshop facilitator: adjust assumptions live and copy/print an assessment for an ADR discussion.

## 3. Functional requirements
| ID | Requirement |
|---|---|
| F01 | Display 14 sliders across agency need (4), AI need (2), delegation concern (3), incremental value (2), control maturity (3). Integer range 0–4 with defined low/high anchors and initial values. |
| F02 | Live recomputation on each input change; visibly label each slider's current value. |
| F03 | Separate hard switches for mandatory pre-action approval and missing foundational controls. |
| F04 | Oversight selection: recommended/auto, HITL, HOTL, HOOTL. Selection must NOT bypass hard gates. |
| F05 | Four architecture outcomes: workflow, AI-assisted workflow, constrained agent, higher-autonomy agent candidate. |
| F06 | Show scores for agency need, AI need, delegation concern, incremental value, control maturity and permissible autonomy. |
| F07 | Flag a >0.35 autonomy–assurance gap with text directing controls improvement or reduced delegation. |
| F08 | Show rationale, caution messages and suggested/selected human oversight. Flag oversight conflicts. |
| F09 | Offer reset, print/save PDF using the browser, and copy assessment JSON. |
| F10 | Keep glossary, scoring rules, science, misuse and cited source links accessible in collapsible sections. |
| F11 | Display “decision support, not authorisation” and “illustrative/uncalibrated heuristic” disclaimers. |

## 4. Scoring logic — present implementation
See `DESIGN_CONTEXT.md` for motivations, caveats and exact interpretation.

```
need = mean(path, choices, changes, multi)
aiNeed = mean(input, judgment)
delegationConcern = mean(impact, 4-reverse, scope)
value = mean(benefit, delay)
maturity = mean(identity, monitor, recover)
ceiling = clamp(4-delegationConcern + 0.75*(maturity-2),0,4)
if approval: ceiling=min(ceiling,2)
if missingControls: ceiling=min(ceiling,1)
gap=max(0,need-ceiling)
```
Decision branches, in order:
1. `need < 1.6`: AI-assisted workflow if `aiNeed >= 1.8`, otherwise workflow automation.
2. `value < 1.8 OR ceiling < 1.6`: defer delegation; AI-assisted workflow if `aiNeed >= 1.8`, otherwise workflow automation.
3. `need >= 2.8 AND value >= 2.8 AND ceiling >= 2.8 AND !approval AND !missingControls`: higher-autonomy agent **candidate**.
4. Else: constrained agent with governed execution.

Cautions: approval, missing controls, high delegation concern (`>=2.5`), low maturity (`<2`), conflicting oversight, plus general caveat when none applies. HOOTL is flagged when approval, missing controls, high concern or low maturity. HOTL alone is flagged as insufficient where HITL is mandatory.

**These cut-offs are invented design heuristics, not measured probabilities or a validated risk model.** Organisational policies may require stricter handling, including disallowing a specific action irrespective of these scores.

## 5. UI structure
- Header/title and succinct scope/disclaimer.
- Left assessment form: question sections, oversight preference, mandatory control switches.
- Right responsive result panel: 4-stage architecture strip, six score meters, graphical plot, rationale, caution and oversight.
- Below: glossary, transparent scoring rules, separately collapsible science, misuse, sources.
- Mobile: stack columns. Desktop: persistent result panel where viewport permits. Print: legible output without truncated expanded evidence.

## 6. Non-functional requirements
- Static, HTTPS public site; no back-end or AI inference.
- Accessibility: meaningful labels and keyboard-accessible ranges/select/checkboxes; sufficient color contrast; dynamic result announcements; test with screen reader and keyboard before broader publication.
- Minimise client data: no persistence, analytics, third-party scripts or network submission of answers by default.
- No S3 public-read policy required when using CloudFront OAC; configure least privilege and secure transport.
- Browser JS errors should not be masked as architecture approvals.
- For production changes, include a rule-version in exported JSON and preserve a changelog.

## 7. Project structure
`index.html` public page; `styles.css` public stylesheet; `app.js` public decision logic; `DESIGN_CONTEXT.md` maintainer reasoning; `SPEC.md` this spec; `README.md` setup/deployment; `tests/canvas.test.cjs`; `package.json`; `deploy.sh`.

## 8. Quality gates
- `node --check app.js` and `npm test`.
- Manual keyboard navigation and one mobile-width browser test.
- Test user-selected HOOTL + required HITL; ensure warning appears in both visible oversight text and exported JSON.
- Verify approval and missing-control caps regardless of elevated maturity scores.
- Verify no assessment values go over the network.
- Verify only three public assets were uploaded to S3.
- Verify default root path and all CSS/JS links load via CloudFront HTTPS.
- Verify no private maintainer files can be retrieved from the public distribution.

## 9. Follow-on enhancements (not implemented)
- Extract a pure, separately importable scoring module and question configuration if a larger app is planned.
- Full browser E2E tests, automated accessibility review and visual regression tests.
- Compare multiple architectures side by side; record counterfactual assumptions and an explicit reviewer decision.
- User-authored ADR export and rules-version migration support.
- If/when persistence is requested, introduce a separately designed privacy and IAM architecture.

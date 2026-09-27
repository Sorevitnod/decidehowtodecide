# Agency Design Canvas — Decision Context and Rationale

**Last updated:** 27 September 2026  
**Status:** Design rationale for maintainers; **not published as part of the user-facing site**.  
**Baseline:** Working HTML Version 5, split into `index.html`, `styles.css`, and `app.js`.

## The original problem

We began with an intuition of a continuum: fully deterministic, non-agentic systems at one end; autonomous, non-deterministic AI agents at the other. The goal was to help architects decide whether a problem needs an agent, a deterministic workflow, or AI within a workflow, and how much freedom to grant.

**Important correction:** Determinism, probability, stochasticity and autonomy are not stages in one sequence. A probabilistic classifier can lack agency; a rule-based robot can have considerable autonomy. A generative AI model can perform probabilistic interpretation inside a fully prescribed execution path.

The canvas must help people avoid introducing agents simply because AI is available, while also avoiding the opposite error: constraining an agent so tightly that the agency which made it valuable disappears.

## Four conceptual distinctions

1. **Predictability:** Deterministic means equal input *and complete system state* produce the same output. Non-deterministic behaviour need not imply randomness; concurrency or unobserved state may explain variable outputs.
2. **Uncertainty:** Probabilistic describes representing or reasoning about uncertainty with probabilities. Stochastic describes a random process or random sampling. These overlap and do not form successive levels of agency.
3. **Decision authority:** Agency means selecting and executing actions towards a goal; autonomy is the degree of discretion and independence. Workflow automation follows prescribed orchestration. AI inference does not automatically imply agency.
4. **Risk-adjusted autonomy:** The organisation may delegate only authority warranted by task value, potential consequences, risk appetite and *evidenced* control maturity. Technical capability ≠ permission to act.

## Three different autonomy measures

- **Required autonomy:** How much independent planning/action is actually necessary to deliver the intended task outcome?
- **Permissible autonomy:** How much independent authority is defensible given the action's impact, reversibility, scope, explicit approval obligations and operating controls?
- **Justified autonomy:** Does additional independence add enough value over feasible workflow and AI-assisted alternatives to warrant the residual risk and governance burden?

This creates an **autonomy–assurance gap** when a task appears to benefit from more autonomy than its controls and delegated authority presently support.

## The autonomy–assurance paradox

More independence can unlock adaptive planning and throughput, but it can also increase exposure, delegated permissions, unpredictable action paths and assurance requirements. If controls are immature, reducing autonomy may erase the value of selecting an agent at all. The possible responses are *not* restricted to 'deploy anyway' or 'ban AI': reduce tool authority, partition high-risk actions, add approval gates, improve controls, keep AI interpretation in a prescribed workflow, or reconsider whether agency is worth the cost.

**Architectural provocation:** “If you need to remove all agency to make your agent safe, have you designed an agent—or an expensive workflow engine?” This is a question to stimulate review, not a claim that constrained agents are useless.

## Human oversight is an independent dimension

Do not encode “workflow = no human” or “agent = human in the loop.” Any architecture may include human approval or unattended operation according to policy and impact.

- **HITL:** Required review/approval before specified actions take effect.
- **HOTL:** Human supervises, can intervene, stop and override while the system operates.
- **HOOTL:** Bounded unattended execution without real-time human approval/supervision of each action; still requires accountable ownership, monitoring appropriate to impact and review.
- Human-before/after-the-loop: people define goals, permission limits and success conditions, and subsequently examine outcomes or exceptions.

Human approval is meaningful only when the reviewer has enough information, time, ability and authority to challenge the proposed action. Approval gates are not proof that a risky system is safe. The selected oversight pattern must never override mandatory approval requirements.

## Possible architectural outcomes

1. **Workflow automation:** prescribed rules, orchestration and permissions; possible human checkpoints.
2. **AI-assisted workflow:** AI handles ambiguous/unstructured interpretation, prediction or generation while the action path and delegation remain prescribed.
3. **Constrained agent:** the agent can plan and select actions inside explicit permissions, scopes, budgets and checkpoints; approval at consequential boundaries.
4. **Higher-autonomy agent candidate:** broader goal-directed execution, *still bounded and accountable*, subject to tested controls and ordinary authorisation. 'Higher autonomy' does not mean unconstrained.

Also consider a deterministic or rule-based planner where task coordination is needed but AI inference is not.

## Current Version 5 scoring — preserve transparency, do not mistake it for science

All sliders run from 0 to 4. Question group means: agency need (`path`, `choices`, `changes`, `multi`), AI need (`input`, `judgment`), incremental agency value (`benefit`, `delay`), control maturity (`identity`, `monitor`, `recover`). Delegation concern averages `impact`, `4 − reverse`, and `scope`.

Current heuristic:
```
ceiling = clamp(4 − delegationConcern + 0.75 × (controlMaturity − 2), 0, 4)
if mandatoryApproval: ceiling = min(ceiling, 2)
if missingFoundationalControls: ceiling = min(ceiling, 1)
gap = max(0, requiredAutonomy − ceiling)
```
If agency need < 1.6: workflow or AI-assisted workflow based on AI need >= 1.8.
Otherwise, if autonomy value < 1.8 or ceiling < 1.6: defer delegated agency, favour workflow or AI-assisted workflow.
Otherwise, if agency need >= 2.8, value >= 2.8, ceiling >= 2.8 and neither hard checkbox is set: higher-autonomy *candidate*.
Otherwise: constrained agent. A gap > 0.35 triggers an autonomy–assurance warning.

**Caution:** Thresholds and weights are *illustrative original design choices*, not empirical calibrated risk scores. A slider 3/4 is not 75% risk, maturity or likelihood. Model recommendations are decision support, not deployment clearance.

## Guardrails for future development

- Keep **need**, **value** and **permission** separate: do not reward high inherent risk with more autonomy or imply maturity alone creates a need for an agent.
- Never silently average away non-negotiable constraints; approvals and unimplemented controls are hard gates in the heuristic and may require stricter real organisational rules.
- Separate stochastic inference from who can take consequential actions. A deterministic orchestration can still invoke an uncertain model.
- Do not imply that constrained agents are deterministic or that workflows cannot cause harm.
- Do not show a user-selected HOOTL pattern as authorised if obligations require HITL or controls are missing.
- Explain *why*, show alternatives, preserve the ability for a human owner to disagree and document that disagreement.
- Distinguish research-backed concepts from this app's unvalidated weights, categories and labels.
- Avoid collecting potentially sensitive architecture/operational inputs by default. Assess privacy/security before adding telemetry, server-side storage, share links or accounts.
- Record a rules-version alongside exported answers if adding persistent export or sharing, so future readers can reproduce the output.

## Why the page has expandable supporting information

The user referenced https://decidehowtodecide.org/ as an interaction pattern: adjustable dimensions, a recommendation with reasons, and collapsible explanations covering the science, misuse and references. The canvas includes a visible glossary and these expandable sections, but this maintainer narrative should remain in this separate file so it is not confused with validated scientific guidance.

## Research starting points (not proof of the canvas thresholds)

- Parasuraman, Sheridan & Wickens (2000), types/levels of automation: https://doi.org/10.1109/3468.844354
- NIST AI RMF 1.0 (2023): https://doi.org/10.6028/NIST.AI.100-1
- NIST Generative AI Profile (2024): https://doi.org/10.6028/NIST.AI.600-1
- ISO/IEC 42001 (2023): https://www.iso.org/standard/42001
- OWASP Top 10 for Agentic Applications (2026): https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- NIST agent hijacking research: https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations
- Goddard et al., automation bias review: https://pmc.ncbi.nlm.nih.gov/articles/PMC3240751/

## Implementation notes for the next maintainer

- `index.html`: semantic inputs, recommendations, glossary and expandable explanations/sources.
- `styles.css`: light responsive styling and print formatting.
- `app.js`: question definitions, DOM generation, heuristic, oversight warnings, export, reset.
- Existing Version 5 had a display defect: it set the visible oversight text *before* adding the selected user preference; this package fixes the update order.
- Change the scoring algorithm only alongside updated tests, a new rules version and explicit documentation of what changed.

# Knowledge Operating System (KOS) — Structure

Searchable, versioned institutional memory. Every observation, experiment, and lesson lands here.

## Directory Layout

```
docs/studio/knowledge/
├── INDEX.md                    # This file — taxonomy + search tags
├── architecture/               # ADRs, module decisions, dependency notes
├── experiments/                # Gameplay experiments (hypothesis → result)
├── tuning/                     # Parameter change history (preset diffs)
├── playtests/                  # Human playtest reports (n, survey, quotes)
├── simulations/                # Bot run summaries, heatmaps, balance diffs
├── bugs/                       # Root cause analyses, regression links
├── debt/                       # Technical debt register (ID, severity, owner)
├── lessons/                    # Post-mortems, review outcomes, retrospectives
├── reviews/                    # Continuous Design Review outputs
├── bibles/                     # Symlinks or copies of current bible versions
└── executive/                  # AI Studio Director weekly/monthly reports
```

## Record Types

| Type | ID Format | Required Fields |
|------|-----------|-----------------|
| Architecture Decision | `ADR-NNN` | context, decision, consequences |
| Experiment | `EXP-YYYY-MM-DD-slug` | hypothesis, method, metrics, outcome |
| Tuning Change | `TUN-preset-date` | before/after, rationale, metric delta |
| Playtest | `PT-M#-date` | n, Fun score, top 3 findings |
| Simulation | `SIM-level-date` | runs, drift %, heatmap path |
| Bug RCA | `BUG-NNN` | detect, classify, root cause, fix, verify |
| Debt Item | `DEBT-NNN` | layer, severity, payoff estimate |
| Lesson | `LSN-YYYY-MM-DD` | trigger, insight, action taken |
| Review | `REV-discipline-date` | recommendations, decisions spawned |

## Search Tags (Mandatory)

Every record includes YAML frontmatter:

```yaml
---
id: EXP-2026-07-07-jump-coyote
tags: [movement, tuning, pillar-p1, milestone-m2]
pillar: P1
milestone: M2
metrics: [jump_success_rate, recovery_rate]
status: concluded
---
```

## Ingestion Rules

| Source | Auto-ingest | Owner |
|--------|-------------|-------|
| CI test/replay results | Yes → `simulations/` or `bugs/` | AI Studio Director |
| Tuning dashboard preset save | Yes → `tuning/` | Gameplay Director |
| Playtest session | Manual template → `playtests/` | QA Lead |
| Phase completion report | Yes → `lessons/` + `executive/` | AI Studio Director |
| Decision record accepted | Yes → `decisions/` mirror | Decision owner |
| Design review | Yes → `reviews/` | Review chair |

## Retention

- **Permanent:** ADRs, decisions, lessons, bible versions
- **Rolling 90 days:** raw simulation dumps (aggregates kept)
- **Rolling 1 year:** playtest raw notes (summary kept)

## Health Metric

**Documentation health score** = % of POS phases with linked KOS records (target ≥95%)

# Executive Dashboard Specification

**System:** SOL §6  
**Audience:** AI Studio Director, discipline leads, Review Board  
**Implementation:** Future `tools/studio-dashboard/` — **spec only**

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STUDIO HEALTH BAR                                                       │
│ PR: 28 │ Fun: -- │ Milestone: M0 │ Experience: -- │ Alert: GREEN        │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│ PRODUCTION           │ GAMEPLAY             │ STUDIO OPS                │
│ · Readiness score    │ · Fun score          │ · Build health            │
│ · Milestone M0–M9    │ · Jump success       │ · Test health             │
│ · Critical path      │ · Recovery rate      │ · Team velocity           │
│ · Gate status G0–G4  │ · Flow index         │ · Content velocity        │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│ RISKS (top 5)          │ TECH DEBT (top 5)     │ DOCS HEALTH              │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│ EXPERIENCE TIMELINE (T0–T8 attainment bars)                             │
├─────────────────────────────────────────────────────────────────────────┤
│ PILLAR HEALTH (P1–P5 radar) │ CDR ACTION TRACKER (open P0/P1)           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Sources

| Widget | Source | Update |
|--------|--------|--------|
| Production readiness | Phase reports, POS PR model | Per phase |
| Fun score | `knowledge/playtests/` | Per playtest |
| Milestone status | SOL + POS M0–M9 | Daily |
| Jump success / recovery / flow | Telemetry → Analytics OS | Per session |
| Build / test health | CI (`npm test`, replay job) | Hourly |
| Team velocity | WAP issued vs completed | Weekly |
| Content velocity | Content factory validators | Weekly |
| Technical debt | `knowledge/debt/DEBT-*.md` | Weekly |
| Documentation health | KOS coverage audit | Weekly |
| Risks | SOL risk register | Weekly |
| Critical path | POS Part XII | Weekly |
| Experience timeline | §9 KPI attainment | Per playtest |
| Pillar health | COS governance | Weekly |
| CDR actions | `knowledge/reviews/` | Per review |

## Alert Logic

| Level | Triggers |
|-------|----------|
| **RED** | Fun ↓5 pts; build failed 2× consecutive; P0 open >48h; drift unresolved |
| **AMBER** | Metric drift >5%; debt +3 items; KOS coverage <80%; gate overdue |
| **GREEN** | All nominal |

**RED →** AI Studio Director recommends studio freeze (no new WAPs).

## Weekly Export

Path: `knowledge/executive/WEEK-YYYY-MM-DD.md`  
Auto-sections: snapshot, completed work, decisions, alerts, risks, critical path, recommendations.

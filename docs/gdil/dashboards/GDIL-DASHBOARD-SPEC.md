# GDIL Dashboard Specification

**Audience:** AI Design Director, Gameplay Director, Creative Director  
**Complements:** SOL Executive Dashboard (engineering) — GDIL focuses on **player experience intelligence**

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FUN HEALTH BAR                                                          │
│ Fun: -- │ DNA: -- │ Emotional: -- │ Open REC P0: 0 │ Alert: GREEN      │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│ FUN ENGINE           │ EMOTIONAL ENGINE     │ MECHANIC LIFECYCLE        │
│ · Composite score    │ · Timeline stages    │ · M1–M8 stage map         │
│ · 10-driver radar    │ · Frustration cap    │ · Blocked mechanics       │
│ · Imbalance alerts   │ · Valence curve      │ · Approval queue          │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│ INTERACTION MATRIX     │ WORLD IDENTITY       │ BOSS READINESS          │
│ · P0 validation status │ · W1–W3 sheets       │ · Framework completion  │
│ · Open edge cases      │ · Differentiation    │ · Simulation pending    │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│ PLAYTEST INTELLIGENCE  │ DESIGN SIMULATION    │ NINTENDO DNA            │
│ · REC queue P0/P1/P2   │ · Predict vs actual  │ · 10-rule compliance    │
│ · Fun trend            │ · Blocked designs    │ · Failure signals       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Alert Logic

| Level | Triggers |
|-------|----------|
| **RED** | Fun <milestone floor; P0 REC >0; DNA <60; frustration >30% session |
| **AMBER** | Driver imbalance; simulation block; mechanic stuck in Iteration >2 weeks |
| **GREEN** | All design health nominal |

**RED →** AI Design Director blocks new DAPs; escalates to AI Studio Director.

## Key Metrics

| Metric | Source | Refresh |
|--------|--------|---------|
| Fun composite | Fun Engine | Per playtest |
| Driver radar | Fun Engine | Per session |
| DNA score | Nintendo DNA Framework | Per content review |
| Emotional health | Emotional Experience Engine | Per playtest |
| Mechanic stages | Lifecycle registry | Per advancement |
| Matrix validation | Interaction Matrix | Per bot run |
| REC queue | Playtest Intelligence | Per playtest |
| Sim calibration | Design Simulation | Weekly |

## Reports

| Report | Cadence | Path |
|--------|---------|------|
| Design health weekly | Weekly | `gdil/reports/DESIGN-WEEK-*.md` |
| Fun trend monthly | Monthly | `gdil/reports/FUN-MONTH-*.md` |
| DNA audit per world | Per world | `gdil/reports/DNA-WORLD-*.md` |

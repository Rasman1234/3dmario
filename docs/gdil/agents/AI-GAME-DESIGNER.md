# AI Game Designer

**Role:** Autonomous gameplay invention orchestrator — GDIL v2.0  
**Supersedes in scope:** Active invention (not ship authorization — see AI Design Director v1)  
**Does not:** Write gameplay implementation code · Create governance layers

---

## Identity

The AI Game Designer is the **creative engine** of GDIL. It continuously discovers, evaluates, evolves, and recommends gameplay — maintaining long-term coherence across mechanics, worlds, and player archetypes.

| v1 AI Design Director | v2 AI Game Designer |
|-----------------------|-------------------|
| Approves / rejects for ship | Proposes / refines / rejects for experiment |
| DAP issuance | PROP / EXP / TUN generation |
| Passive validation | Active invention |
| "Is this good enough?" | "What would make this better?" |

Both roles may be executed by one agent process; responsibilities stay separate.

---

## Subsystem Orchestration Map

| Priority | Subsystem | When Invoked |
|----------|-----------|--------------|
| 1 | Fun Engine | Every loop — deficit detection |
| 2 | Replay Intelligence | After every replay ingest |
| 3 | Experience Prediction | Before every PROP promotion |
| 4 | Mechanic Discovery | When deficit + open graph slot |
| 5 | Design Space Explorer | When tuning/mechanic branch needed |
| 6 | Mechanic Evolution | On every experiment result |
| 7 | Gameplay Dependency Graph | Before combos, after tuning |
| 8 | Content Intelligence | Per level/world completion |
| 9 | Player Archetype Intelligence | Per content eval + weekly gap |
| 10 | Dynamic Difficulty Intelligence | On frustration spike |
| — | Nintendo DNA | Hard filter on all outputs |

---

## Decision Types

| Output | Meaning | Next Step |
|--------|---------|-----------|
| `PROP-{id}` | Design proposal | Human review → Experiment |
| `EXP-{id}` | Scheduled experiment | Research Lab / playtest |
| `TUN-{id}` | Tuning recommendation | Feel Lab / Identity Guard |
| `REJ-{id}` | Rejected candidate | Archived with rationale |
| `REC-{id}` | Replay/content fix | Playtest Intelligence merge |
| `COH-{id}` | Coherence warning | Block related PROP until resolved |

---

## Rejection Criteria (Low-Value Ideas)

Automatic `REJ-*` when any:

- Novelty score <0.2  
- DNA compliance <70  
- Player value rank below Pareto frontier  
- Dependency graph predicts cascade risk >0.7  
- Archetype fit improvement <5% for all personas  
- Prediction confidence tier = low AND fun lift <8 pts  
- Coherence Monitor flags identity conflict  

Every rejection includes **explanation** and **alternative suggestion** when possible.

---

## Coherence Monitor

Long-term gameplay identity maintained via:

```
coherence_score = mean(dna_compliance, world_identity_alignment, graph_stability)

IF coherence_score drops >10% over 2 weeks:
  PAUSE mechanic discovery
  SURFACE COH-{id} with conflicting proposals listed
  RECOMMEND convergence on canonical evolution branches
```

---

## Weekly Output

`reports/DESIGN-INVENTION-WEEK-{date}.md` — see [ACTIVE-GAME-DESIGN-INTELLIGENCE.md](../ACTIVE-GAME-DESIGN-INTELLIGENCE.md)

---

## Integration

| Layer | Interaction |
|-------|-------------|
| GDIL v1 | Uses Fun, MKB, Sim, DNA; hands off to Design Director at Approval |
| SOL | Writes KOS only — no new WAP types |
| POS | Reads phase availability; schedules EXP against labs |

---

## KPIs

| KPI | Target |
|-----|--------|
| Useful PROP rate (human ≥6/10) | ≥60% |
| Experiment success rate | ≥30% improve Fun driver |
| Rejection precision | ≥70% |
| Coherence score | ≥85 |
| Time deficit → first EXP | <7 days |

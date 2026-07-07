# Studio Risk Register

**Owner:** AI Studio Director  
**Review:** Weekly (Executive Dashboard)  
**Source:** POS Part XIII + SOL drift detection

| ID | Risk | L | I | Score | Status | Mitigation | Owner |
|----|------|---|---|-------|--------|------------|-------|
| R1 | Fun never reaches 60 | 4 | 5 | 20 | Open | G1 gate + CDR gameplay | Gameplay Director |
| R2 | Bot sim ≠ human fun | 4 | 4 | 16 | Open | Pair bot + human playtest | QA Lead |
| R3 | SOL process overhead slows solo dev | 3 | 4 | 12 | Open | Lightweight WAP for doc-only work | AI Studio Director |
| R4 | Rapier non-determinism | 3 | 4 | 12 | Open | Pinned WASM + tolerance | Technical Director |
| R5 | Art pipeline never stands up | 3 | 5 | 15 | Open | Art Bible + Phase 49 spec | Art Director |
| R6 | Review theater / checkbox fatigue | 2 | 4 | 8 | Open | Evidence packets mandatory | AI Studio Director |
| R7 | Vision drift without detection | 3 | 4 | 12 | Open | COS weekly pillar audit | Creative Director |
| R8 | Knowledge base not maintained | 3 | 3 | 9 | Open | KOS ingestion rules | AI Studio Director |
| R9 | Meta loop masks weak core | 3 | 4 | 12 | Open | Block meta until M3 G1 | Creative Director |
| R10 | Perf collapse at content scale | 3 | 5 | 15 | Open | Perf CDR weekly | Technical Director |

**Score** = Likelihood × Impact (max 25)

## Escalation

| Score | Action |
|-------|--------|
| ≥15 | RED or AMBER dashboard; prioritize in backlog |
| 10–14 | Track in weekly executive report |
| <10 | Monitor |

# Multi-Agent Creative Council — Protocol Reference

**Platform:** [CREATIVE-GAME-DESIGN-PLATFORM.md](../CREATIVE-GAME-DESIGN-PLATFORM.md) §10  
**Purpose:** Structured debate before major design acceptance

---

## Agent Personas

### Gameplay Designer
- **Focus:** Fun drivers, mechanic teach chains, player verbs  
- **Questions:** "Does this teach before it tests?" "Which pillar does this serve?"  
- **Veto:** Broken grammar sequence, fun driver floor miss  

### Level Designer
- **Focus:** Spatial pacing, routing, secrets, recover beats  
- **Questions:** "Is there a reward desert?" "Can the player read the goal?"  
- **Veto:** Soft-lock, missing RECOVER after EXAM  

### Encounter Designer
- **Focus:** Telegraph clarity, enemy/platform pairing  
- **Questions:** "Is every damage source readable in 0.5s?"  
- **Veto:** Unfair encounter, matrix edge case unhandled  

### UX Designer
- **Focus:** Goal clarity, onboarding load, HUD needs  
- **Questions:** "Will a first-time player know what to do?"  
- **Veto:** Ambiguous objective without signpost option  

### Accessibility Designer
- **Focus:** Motion, telegraph extension, assist compatibility  
- **Questions:** "Does this work with assist mode?"  
- **Veto:** Accessibility checklist fail  

### Technical Designer
- **Focus:** JSON/schema validity, entity budgets, build path  
- **Questions:** "Can POS Level Factory ingest this?"  
- **Veto:** Unbuildable or schema-breaking spec  

### Performance Advisor
- **Focus:** Draw calls, entity count, particle caps  
- **Questions:** "Does this exceed world perf budget?"  
- **Veto:** Budget breach without LOD plan  

---

## Debate Transcript Template

```markdown
# COUNCIL-{date}-{concept_id}

## Concept Summary
- Type: WORLD | LVL | BOSS | ENC
- CREVAL score: {score}
- Generator: {subsystem}

## Agent Votes
| Agent | Score | Vote | Top Concern |
|-------|-------|------|-------------|
| Gameplay | | | |
| Level | | | |
| ...

## Round 1 — Positions
{agent statements}

## Round 2 — Rebuttals
{responses}

## Synthesis
{orchestrator summary}

## Verdict
**Decision:** accept | revise | reject  
**Rationale:** {transparent explanation}  
**Revision checklist:** {if revise}  
**Dissent:** {minority opinions}
```

---

## When Council Required

| Concept Type | Threshold |
|--------------|-----------|
| World concept | Always |
| Boss concept | Always |
| Level (ship candidate) | Always |
| Encounter batch | Sample 20% |
| Grammar variant | CREVAL ≥80 only |
| Puzzle | Optional |

Human designer may **chair** council — final approve still required via HCD workflow.

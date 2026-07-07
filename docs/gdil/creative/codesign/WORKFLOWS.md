# Human–AI Co-Design Workflows

**Platform:** [CREATIVE-GAME-DESIGN-PLATFORM.md](../CREATIVE-GAME-DESIGN-PLATFORM.md) §12

---

## Workflow 1: Level from Brief

| Step | Actor | Action |
|------|-------|--------|
| 1 | Human | Write brief: world, mechanics, emotion, duration |
| 2 | AI | Grammar Generator → 2–3 GRAM options |
| 3 | Human | Pick grammar spine |
| 4 | AI | Level Synthesis → LVL-A/B/C |
| 5 | AI | Present tradeoff table (readability vs mastery vs exploration) |
| 6 | Human | Pick variant + mark critique zones |
| 7 | AI | Revise segments, re-run CREVAL |
| 8 | AI | Council debate (if ship candidate) |
| 9 | Human | Approve / veto → `HCD-{id}` |
| 10 | AI | Emit PROP → existing DAP path |

---

## Workflow 2: World Concept

| Step | Actor | Action |
|------|-------|--------|
| 1 | Human | Set tone, differentiation requirements, mechanic budget |
| 2 | AI | World Generator → 3 WORLD concepts |
| 3 | Human | Select + refine identity dimensions |
| 4 | AI | Boss Generator + Economy Sim for selected world |
| 5 | AI | Council full debate |
| 6 | Human | Chair council, resolve tie-breaks |
| 7 | AI | Level briefs → Workflow 1 per level |

**Rule:** Worlds always require human chair approval.

---

## Workflow 3: Encounter Polish

| Step | Actor | Action |
|------|-------|--------|
| 1 | AI | Encounter Generator batch for segment |
| 2 | Human | Play paper prototype or sandbox (when available) |
| 3 | Human | Timestamp critique: "unclear telegraph here" |
| 4 | AI | Revise ENC, attach CAM recommendation |
| 5 | Human | Approve ENC for level stitch |

---

## Workflow 4: Veto and Learn

| Step | Actor | Action |
|------|-------|--------|
| 1 | Human | Veto concept with reason |
| 2 | AI | Write CRE-FAIL record |
| 3 | AI | Suggest alternative respecting veto reason |
| 4 | Human | Accept alternative or new brief |

---

## Approval Record Template

```yaml
hcd_session:
  id: HCD-2026-07-07-grassland-alt
  human: lead_designer
  concept: LVL-W1-03-B
  decision: approved
  critiques_applied: [widen_gap_segment_4, add_recover_after_exam]
  overrides: [kept_secret_placement_ai_disputed]
  council_ref: COUNCIL-2026-07-07-LVL-W1-03
```

---

## Principles

1. Minimum **3 AI variants** before human commits  
2. Human **critique is data** — feeds Creative Memory  
3. Human **veto is final** — no autonomous ship of worlds/bosses  
4. AI **explains tradeoffs** in plain language  
5. Same governance path after approval — DAP → WAP unchanged

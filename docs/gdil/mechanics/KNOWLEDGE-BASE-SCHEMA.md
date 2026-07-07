# Mechanic Knowledge Base (MKB) — Schema

**Subsystem:** GDIL §3  
**Location:** `docs/gdil/mechanics/records/MKB-{id}.md`

---

## Record Template

```yaml
---
id: MKB-M1
name: Basic Jump
lifecycle_stage: experiment
pillar: P1
fun_drivers: [success, expression, recovery]
worlds: [all]
status: active
---
```

## Required Fields

### 1. Purpose

*Why does this mechanic exist? What player fantasy does it serve?*

| Field | Example (M1 Jump) |
|-------|-------------------|
| Player fantasy | "I can confidently cross gaps" |
| Pillar | P1 Expressive Movement |
| Fun drivers | Success, Expression, Recovery |

### 2. Dependencies

| Type | Description |
|------|-------------|
| **Mechanic deps** | Requires grounded state, coyote time |
| **System deps** | PhysicsWorld, MovementController, camera stable |
| **Content deps** | Platform spacing within jump reach |

### 3. Interactions

*Link to Interaction Matrix rows.*  
Format: `{actor} × {target} → behavior`

Example: `Player × Platform → land, inherit velocity (moving)`

### 4. Difficulty

| Parameter | Range | Notes |
|-----------|-------|-------|
| Base difficulty | 0.2–0.4 | TEACH/PRACTICE |
| Exam difficulty | 0.5–0.7 | After grammar |
| Mastery difficulty | 0.7–0.9 | Optional |

### 5. Tutorial Strategy

| Grammar Node | Approach |
|--------------|----------|
| TEACH | Single gap, no fail state, signpost |
| PRACTICE | 3 gaps, increasing width |
| TWIST | Jump during slight elevation change |
| MASTER | Pixel-tight optional coin route |

### 6. Telemetry

| Event | Fields |
|-------|--------|
| `jump` | tick, position, coyote_used, buffer_used |
| `land` | tick, velocity, success, platform_type |
| `jump_fail` | tick, gap_width, cause |

**Derived KPIs:** jump_success_rate, missed_jump_rate

### 7. Known Issues

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| — | — | — | — |

### 8. Playtest History

| Date | Report | n | Key finding |
|------|--------|---|-------------|
| — | — | — | — |

### 9. Retirement Conditions

| Condition | Threshold |
|-----------|-----------|
| Superseded by | MKB-M3 double jump (partial overlap) |
| Usage below | <5% sessions after World 2 |
| Fun driver negative | Success driver <0.4 for 3 playtests |

---

## Index

See [MKB-INDEX.md](./MKB-INDEX.md)

## Search Tags

`pillar`, `fun_driver`, `lifecycle_stage`, `world`, `difficulty_band`

## Integration

| Consumer | Use |
|----------|-----|
| Fun Engine | Driver KPI mapping |
| Lifecycle | Stage advancement evidence |
| Interaction Matrix | Row ownership |
| Design Simulation | Input parameters |
| SOL KOS | Mirror summaries to `knowledge/experiments/` |

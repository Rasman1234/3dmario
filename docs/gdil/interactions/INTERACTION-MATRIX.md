# Gameplay Interaction Matrix

**Subsystem:** GDIL §4  
**Purpose:** Model all pairwise interactions — expected behaviour, edge cases, telemetry, risks, validation

---

## 1. Actors

| Actor | ID |
|-------|-----|
| Player | `ACT_PLAYER` |
| Enemy | `ACT_ENEMY` |
| Boss | `ACT_BOSS` |
| Platform | `ACT_PLATFORM` |
| Power-up | `ACT_POWERUP` |
| Collectible | `ACT_COLLECTIBLE` |
| Physics | `ACT_PHYSICS` |
| Camera | `ACT_CAMERA` |
| Hazards | `ACT_HAZARD` |
| Environment | `ACT_ENV` |

**Matrix size:** 10×10 = 100 cells (55 unique pairs). Priority cells marked **P0**.

---

## 2. Cell Schema

Each interaction cell `INT-{A}-{B}` documents:

| Field | Content |
|-------|---------|
| **Expected behaviour** | Normal-case outcome |
| **Edge cases** | Boundary conditions |
| **Telemetry** | Events emitted |
| **Balancing risks** | Fun driver impact |
| **Automated validation** | Bot/replay/assertion rule |

---

## 3. Priority Interactions (P0)

### INT-PLAYER-PLATFORM

| Field | Specification |
|-------|---------------|
| **Expected** | Land on top → grounded; inherit moving platform velocity; snap to moving surface |
| **Edge cases** | Corner land; moving + spring; one-way platform; fall-through platform |
| **Telemetry** | `land`, `platform_type`, `platform_velocity_inherited` |
| **Balancing risks** | Low recovery if snap fails; surprise if spring unexpected |
| **Validation** | Bot T2 completes moving platform lab; jump success ≥75% |

### INT-PLAYER-ENEMY

| Field | Specification |
|-------|---------------|
| **Expected** | Stomp from above → defeat; side contact → player damage + knockback; i-frames after hit |
| **Edge cases** | Simultaneous stomp/hit; enemy on slope; airborne stomp |
| **Telemetry** | `enemy_hit`, `stomp`, `player_damage`, `death_cause:enemy` |
| **Balancing risks** | Frustration if telegraph <0.5s; challenge driver spike |
| **Validation** | Telegraph timer ≥0.5s; deaths from side contact <70% of enemy deaths |

### INT-PLAYER-BOSS

| Field | Specification |
|-------|---------------|
| **Expected** | Phase-based patterns; damage windows; recovery segments between phases |
| **Edge cases** | Phase transition during player air state; arena edge fall |
| **Telemetry** | `boss_phase`, `boss_damage_dealt`, `boss_damage_taken`, `boss_defeat` |
| **Balancing risks** | Emotional pacing break if no recovery window |
| **Validation** | Boss Intelligence checklist; ≤3 avg deaths |

### INT-PLAYER-CAMERA

| Field | Specification |
|-------|---------------|
| **Expected** | Camera follows without occlusion; collision push smooth; comfort angular velocity capped |
| **Edge cases** | Tight corridor; vertical shaft; boss arena zoom |
| **Telemetry** | `camera_collision`, `camera_occlusion`, `angular_velocity` |
| **Balancing risks** | Success driver collapse if jump unreadable |
| **Validation** | Intervention rate <3/sec traverse; occlusion <15% |

### INT-PLAYER-PHYSICS

| Field | Specification |
|-------|---------------|
| **Expected** | Gravity, coyote, buffer, wall probe, slope limit, step height |
| **Edge cases** | Frame-perfect jump; physics tunneling at speed; wall slide edge |
| **Telemetry** | `jump`, `coyote_used`, `wall_contact`, `grounded` |
| **Balancing risks** | Expression + success drivers |
| **Validation** | Golden replay determinism; jump success KPI |

### INT-PLAYER-HAZARD

| Field | Specification |
|-------|---------------|
| **Expected** | Visible hazard → damage or death; lava/spikes/pit with distinct read |
| **Edge cases** | Hazard at checkpoint; hazard + enemy combo |
| **Telemetry** | `death_cause:hazard`, `hazard_type` |
| **Balancing risks** | Surprise (negative) if unreadable |
| **Validation** | Death survey "fair?" ≥70%; hazard visible in screenshot review |

### INT-PLAYER-POWERUP

| Field | Specification |
|-------|---------------|
| **Expected** | Pickup → state change with VFX/audio <100ms; duration or consumable clear |
| **Edge cases** | Pickup during damage i-frames; power-up loss on death |
| **Telemetry** | `powerup_acquire`, `powerup_expire`, `powerup_use` |
| **Balancing risks** | Reward + expression drivers |
| **Validation** | Reward density spike on acquire; survey delight ≥6/10 |

### INT-PLAYER-COLLECTIBLE

| Field | Specification |
|-------|---------------|
| **Expected** | Magnet or touch pickup; tally update; micro-reward feedback |
| **Edge cases** | Collectible over pit; chain combo |
| **Telemetry** | `coin`, `star`, `collectible_type`, `combo_multiplier` |
| **Balancing risks** | Reward density; discovery if hidden |
| **Validation** | First reward <60s; density 8–15/min |

### INT-ENEMY-PLATFORM

| Field | Specification |
|-------|---------------|
| **Expected** | Enemy respects platform edges; patrol paths valid |
| **Edge cases** | Enemy falls off moving platform; enemy blocks narrow path |
| **Telemetry** | `enemy_fall`, `enemy_patrol_reset` |
| **Balancing risks** | Challenge fairness |
| **Validation** | Enemy stays on nav mesh; no soft-lock |

### INT-PLATFORM-ENVIRONMENT

| Field | Specification |
|-------|---------------|
| **Expected** | Platforms readable against background; collision matches visual |
| **Edge cases** | Decorative mesh with hidden collider |
| **Telemetry** | `missed_jump` (if visual mismatch suspected) |
| **Balancing risks** | Success driver — "fake floor" deaths |
| **Validation** | Art readability review; collision debug overlay match |

---

## 4. Matrix Maintenance

| Trigger | Action |
|---------|--------|
| New mechanic approved | Add rows for all actor pairs |
| Playtest death cluster | Audit relevant cells |
| Bot regression | Run cell validation rules |
| World Identity defined | Tag world-specific edge cases |

## 5. Automated Validation Tiers

| Tier | When | Coverage |
|------|------|----------|
| V0 | Prototype | P0 cells manual checklist |
| V1 | Approval | P0 cells bot/replay |
| V2 | Level ship | All cells for used actors |
| V3 | World ship | Full matrix regression nightly |

## 6. Matrix Dashboard

Display: heatmap of **open edge cases** + **failed validations** by cell.

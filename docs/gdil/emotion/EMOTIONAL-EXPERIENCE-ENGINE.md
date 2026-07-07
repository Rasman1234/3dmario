# Emotional Experience Engine

**Subsystem:** GDIL §7  
**Purpose:** Model player emotional journey with telemetry, surveys, and target ranges

---

## 1. Emotional States

| State | Valence | Arousal | Player Feeling |
|-------|---------|---------|----------------|
| **Curiosity** | Positive | Medium | "What's there?" |
| **Delight** | Positive | High | "That was great!" |
| **Confidence** | Positive | Medium | "I've got this" |
| **Tension** | Neutral | High | "This is hard" |
| **Frustration** | Negative | High | "That's unfair" |
| **Relief** | Positive | Low | "I made it" |
| **Triumph** | Positive | High | "I mastered it" |
| **Wonder** | Positive | Medium | "This world is amazing" |
| **Anticipation** | Positive | Medium | "Boss coming" |
| **Satisfaction** | Positive | Low | "Good session" |

---

## 2. Experience Timeline → Emotional Mapping

Extends SOL Experience Timeline (T0–T8) with emotional targets.

| Timeline | Dominant States | Secondary | Avoid |
|----------|-----------------|-----------|-------|
| **First minute** | Curiosity, Confidence | Delight | Frustration |
| **First reward** | Delight, Satisfaction | Confidence | — |
| **First challenge** | Tension, Anticipation | Confidence | Frustration |
| **First failure** | Frustration (brief) → Relief | Confidence | Sustained Frustration |
| **First mastery** | Triumph, Delight | Confidence | — |
| **Boss** | Anticipation → Tension → Triumph | Relief (windows) | Frustration >30% session |
| **World completion** | Wonder, Satisfaction, Triumph | Delight | — |
| **Endgame** | Triumph, Wonder, Satisfaction | Anticipation (credits) | Frustration |

---

## 3. Measurement Model

### Telemetry Proxies

| State | Proxy Signals |
|-------|---------------|
| Curiosity | `path_deviation`, `camera_pan_idle`, `exploration_index` |
| Delight | `reward_burst`, `shortcut_unlock`, post-reward session continue |
| Confidence | `jump_success` rising, `death` declining, `retry` without quit |
| Tension | `retry_rate` moderate, `heart_rate_proxy` = sustained engagement |
| Frustration | `same_spot_death`, `pause`, `quit`, `frustration_index` |
| Relief | `checkpoint_activate`, `boss_phase_clear`, `death` then success |
| Triumph | `boss_defeat`, `optional_route_complete`, `no_damage_streak` |
| Wonder | `vista_dwell` >3s, `secret_found`, survey awe |
| Anticipation | pre-boss `move_speed` variance, `boss_intro` |
| Satisfaction | `session_end:positive`, `return_within_24h` |

### Survey Instruments (Post-Segment)

| Question | Maps To |
|----------|---------|
| "I felt curious exploring" 1–7 | Curiosity |
| "That moment felt great" 1–7 | Delight |
| "I felt in control" 1–7 | Confidence |
| "That was stressful but fair" 1–7 | Tension |
| "That felt unfair" 1–7 | Frustration (inverse) |
| "I'm glad I kept going" 1–7 | Relief / Satisfaction |
| "I felt proud" 1–7 | Triumph |
| "This world feels special" 1–7 | Wonder |

---

## 4. Target Ranges by Milestone

### M3 Vertical Slice

| Stage | Target Emotional Mix | Frustration Cap |
|-------|---------------------|-----------------|
| First minute | 60% Confidence, 30% Curiosity | <10% |
| First reward | 70% Delight | <5% |
| First challenge | 50% Tension, 40% Confidence | <15% |
| First failure | Frustration <20s then Relief | <25% session time |
| First mastery | 60% Triumph | — |
| Boss | 40% Tension, 30% Anticipation, 30% Triumph | <30% |

### M4 World 1 Complete

| Stage | Additional Target |
|-------|-------------------|
| World completion | Wonder ≥6/7 survey; Satisfaction ≥6/7 |

### M9 Ship

| Stage | Target |
|-------|--------|
| Endgame | Triumph + Wonder ≥6.5/7; Frustration <15% final session |

---

## 5. Emotional Pacing Curve

```
Arousal
  ▲
  │     ╭─Boss──╮              ╭Endgame╮
  │    ╱         ╲            ╱         ╲
  │   ╱ Challenge ╲──╮      ╱           │
  │  ╱              ╲ ╲    ╱            │
  │ ╱ First reward   ╲╲──╱  World done  │
  │╱                  ╲    ╱              │
  └──────────────────────────────────────▶ Time
     First min    Mastery    Boss    End
```

**Rule:** No more than 120s sustained high-arousal negative (frustration) without relief beat.

## 6. Emotional Health Score

```
Emotional Health = weighted_positive_states − penalty(frustration_duration)

Target: ≥70 at M3, ≥80 at M9
```

Displayed on GDIL Dashboard alongside Fun Engine radar.

## 7. Integration

| System | Link |
|--------|------|
| Fun Engine | Frustration ↔ recovery driver; Delight ↔ reward |
| Boss Intelligence | Emotional pacing section |
| World Identity | Emotional identity dimension |
| Playtest Intelligence | Survey synthesis |
| Design Simulation | Predicted emotional curve |

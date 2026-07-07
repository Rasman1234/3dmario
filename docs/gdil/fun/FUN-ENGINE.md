# Fun Engine — Formal Enjoyment Model

**Subsystem:** GDIL §1  
**Purpose:** Explain how enjoyment is **intentionally created**, not accidentally discovered

---

## 1. Core Equation

Fun is not a single number. It is a **dynamic balance** of ten enjoyment drivers:

```
Fun(t) = f(novelty, challenge, success, reward, expression, discovery, surprise, mastery, recovery, replayability)
```

Each driver has **inputs** (design levers), **outputs** (player signals), and **KPIs** (measurable proxies).

**Composite Fun Score (0–100):**

```
Fun = Σ (weight_i × normalize(KPI_i))   where Σ weight = 1.0
```

Default weights (tunable per milestone):

| Driver | Weight | Rationale |
|--------|--------|-----------|
| Success | 0.14 | Foundation — repeated failure kills all other drivers |
| Recovery | 0.12 | Platformers live or die on retry feel |
| Challenge | 0.11 | Engagement without frustration |
| Mastery | 0.11 | Long-term satisfaction |
| Expression | 0.10 | Movement-as-verb identity |
| Discovery | 0.10 | Curiosity loop |
| Reward | 0.09 | Dopamine pacing |
| Novelty | 0.08 | Freshness without chaos |
| Surprise | 0.08 | Memorable peaks |
| Replayability | 0.07 | Return motivation |

---

## 2. Driver Specifications

### 2.1 Novelty

| Aspect | Definition |
|--------|------------|
| **Input** | New mechanic, biome, enemy, setpiece, route |
| **Output** | Player attention spike, exploration deviation |
| **KPIs** | `novelty_events_per_15min` (target 2–4), `path_deviation_index`, survey "something new" % |
| **Target band** | 2–4 novel beats per 15 min; <1 = stale, >6 = overwhelming |
| **Failure signal** | Player describes session as "samey" in survey |

### 2.2 Challenge

| Aspect | Definition |
|--------|------------|
| **Input** | Obstacle density, grammar EXAM nodes, enemy placement |
| **Output** | Sustained engagement, elevated heart rate (proxy: retry without quit) |
| **KPIs** | `platform_difficulty_score` (0.4–0.7), `retry_rate`, `deaths_per_checkpoint` |
| **Target band** | Difficulty 0.4–0.7 per segment |
| **Failure signal** | Quit within 2 min of challenge; difficulty >0.85 sustained |

### 2.3 Success

| Aspect | Definition |
|--------|------------|
| **Input** | Fair telegraphs, achievable jump arcs, readable goals |
| **Output** | Competence feeling, forward momentum |
| **KPIs** | `jump_success_rate` (≥75%), `segment_completion_rate`, survey competence 1–10 |
| **Target band** | Jump success ≥75% post-teach |
| **Failure signal** | Jump success <60% after PRACTICE node |

### 2.4 Reward

| Aspect | Definition |
|--------|------------|
| **Input** | Coins, stars, vistas, shortcuts, power-ups |
| **Output** | Micro-delight, progress satisfaction |
| **KPIs** | `reward_density` (8–15/min), `time_since_last_reward`, pickup VFX latency <100ms |
| **Target band** | 8–15 micro-rewards/min |
| **Failure signal** | >90s without any reward event |

### 2.5 Expression

| Aspect | Definition |
|--------|------------|
| **Input** | Movement depth, optional routes, style jumps, air control |
| **Output** | Player-initiated flair, non-optimal path choice |
| **KPIs** | `optional_route_uptake`, `air_time_variance`, `trick_attempts` (if applicable) |
| **Target band** | Optional route uptake ≥10% |
| **Failure signal** | Single optimal path dominates >95% sessions |

### 2.6 Discovery

| Aspect | Definition |
|--------|------------|
| **Input** | Secrets, vistas, audio cues, gated paths |
| **Output** | Curiosity satisfaction, world feels larger |
| **KPIs** | `exploration_index`, `secret_discovery_rate`, `backtrack_ratio` |
| **Target band** | Exploration index 0.35–0.55; 40%+ obvious secrets found |
| **Failure signal** | Linear path only; exploration index <0.2 |

### 2.7 Surprise

| Aspect | Definition |
|--------|------------|
| **Input** | Scripted beats, enemy intro, physics twist, setpiece |
| **Output** | Memorable moment, positive valence |
| **KPIs** | `surprise_events_per_session` (2–4 per 15 min), survey "unexpected delight" % |
| **Target band** | 2–4 positive surprises per 15 min |
| **Failure signal** | Surprise from unfair death (negative surprise) |

### 2.8 Mastery

| Aspect | Definition |
|--------|------------|
| **Input** | MASTER grammar nodes, skill ceilings, speedrun routes |
| **Output** | Improvement over sessions, optional hard content |
| **KPIs** | `competence_slope` (positive over 3 sessions), `mastery_variance`, `no_damage_streak` |
| **Target band** | Competence slope positive; mastery routes attempted |
| **Failure signal** | Flat competence curve after 5 sessions |

### 2.9 Recovery

| Aspect | Definition |
|--------|------------|
| **Input** | Respawn speed, checkpoint fairness, RECOVER grammar nodes |
| **Output** | Return to flow after failure |
| **KPIs** | `recovery_rate` (≥90% <2s), `frustration_index`, `same_spot_death_cluster` |
| **Target band** | Recovery ≥90%; frustration index <0.25 |
| **Failure signal** | Same-spot deaths ≥5 without progression |

### 2.10 Replayability

| Aspect | Definition |
|--------|------------|
| **Input** | Secrets remaining, mastery routes, collectibles, NG+ hooks |
| **Output** | Return sessions, completionist behavior |
| **KPIs** | `return_within_24h` (local), `completionist_path_uptake`, `session_count_per_user` |
| **Target band** | Median session ≥12 min; return rate TBD at beta |
| **Failure signal** | Single-session abandonment >70% playtesters |

---

## 3. Fun Engine Inputs / Outputs Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        INPUTS                                │
│  Level grammar · Mechanic state · World identity · Boss spec │
│  Reward placement · Enemy telegraphs · Camera profile        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     FUN ENGINE                               │
│  10 drivers × weights → composite Fun score                    │
│  Driver balance radar · Imbalance alerts                       │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       OUTPUTS                                │
│  Fun score 0–100 · Driver radar · Design recommendations       │
│  Simulation predictions · GDIL review pass/fail              │
└─────────────────────────────────────────────────────────────┘
```

## 4. Driver Imbalance Alerts

| Pattern | Diagnosis | Design Action |
|---------|-----------|---------------|
| High challenge + low success + low recovery | Frustration spiral | Add TEACH/RECOVER; reduce difficulty |
| High reward + low challenge | Trivial | Add TWIST/EXAM |
| High novelty + low mastery | Shallow | Add MASTER nodes |
| High success + low expression | On-rails | Add optional routes |
| High discovery + low surprise | Predictable secrets | Add interaction surprises |
| High surprise + low recovery | Unfair | Fix telegraphs; add checkpoints |

## 5. Fun Score Milestones

| Milestone | Fun Target | Minimum Driver Floors |
|-----------|------------|------------------------|
| M2 (labs) | ≥35 | Success ≥0.5, Recovery ≥0.5 |
| M3 (slice G1) | ≥60 | All drivers ≥0.45 |
| M4 (World 1) | ≥65 | Discovery, Mastery ≥0.5 |
| M9 (ship) | ≥75 | All drivers ≥0.6 |

**Floor rule:** No GDIL authorization if any driver below floor for target milestone.

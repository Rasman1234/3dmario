# World Identity System

**Subsystem:** GDIL §5  
**Purpose:** Every world has a distinct, coherent identity across nine dimensions

---

## 1. Identity Dimensions

Each world requires a **World Identity Sheet** (`worlds/records/WORLD-{id}.md`):

| Dimension | Question | Example (Grassland W1) |
|-----------|----------|------------------------|
| **Gameplay identity** | What verbs dominate? | Jump, explore, gentle combat |
| **Movement identity** | How does movement *feel* here? | Forgiving arcs, wide platforms |
| **Enemy identity** | What enemies teach? | Slow patrol, stomp-readable |
| **Puzzle identity** | What spatial puzzles appear? | Route choice, hidden lower path |
| **Visual identity** | Silhouette, palette, density? | Green horizons, soft shapes |
| **Audio identity** | Music mood, SFX palette? | Bright melodic, bouncy footsteps |
| **Reward identity** | What rewards dominate? | Coin trails, vista stars |
| **Secret identity** | How are secrets hidden? | Obvious pipes, attentive ledges |
| **Boss identity** | Climax fantasy? | Size contrast, pattern dance |
| **Emotional identity** | Target emotional tone? | Wonder, playfulness, confidence |

---

## 2. World Identity Sheet Template

```yaml
---
id: WORLD-W1
name: Grassland Kingdom
milestone: M4
mechanics_introduced: [M1, M2, M3, M4, M7, M8]
emotional_arc: wonder → confidence → triumph
---
```

### Coherence Rules

1. All 10 dimensions must be filled — no TBD at G2 content gate  
2. Movement identity must align with Gameplay identity  
3. Enemy identity must not contradict Fair Challenge pillar  
4. Emotional identity must map to Emotional Experience Engine stages  
5. Boss identity must reference Boss Intelligence framework  

### Differentiation Rule

No two worlds may share identical vectors on ≥4 dimensions without DEC waiver.

---

## 3. World Registry

| ID | Name | Status | Emotional Tone |
|----|------|--------|----------------|
| WORLD-W0 | Research / Labs | Active | Clinical, iterative |
| WORLD-W1 | Grassland | Planned | Wonder, confidence |
| WORLD-W2 | TBD | Planned | — |
| WORLD-W3 | TBD | Planned | — |

---

## 4. Identity ↔ Fun Engine Mapping

| Dimension | Primary Fun Drivers |
|-----------|---------------------|
| Gameplay | Challenge, Success, Mastery |
| Movement | Expression, Success |
| Enemy | Challenge, Recovery, Surprise |
| Puzzle | Discovery, Mastery |
| Visual | Discovery, Success (readability) |
| Audio | Reward, Surprise |
| Reward | Reward, Replayability |
| Secret | Discovery, Surprise |
| Boss | Challenge, Mastery, Surprise |
| Emotional | All drivers (pacing) |

---

## 5. Review Cadence

| Event | Review |
|-------|--------|
| World greenlight | Full identity sheet draft |
| First level blockout | Movement + visual identity check |
| World complete | All dimensions validated vs playtest |
| Cross-world compare | Differentiation audit |

## 6. Failure Signals

| Signal | Diagnosis |
|--------|-----------|
| Playtesters can't describe world in one word | Weak emotional identity |
| Death heatmap uniform | Gameplay identity too flat |
| Secrets found 100% | Secret identity too obvious |
| Secrets found <20% | Secret identity too obscure |
| Music feels wrong in survey | Audio identity mismatch |

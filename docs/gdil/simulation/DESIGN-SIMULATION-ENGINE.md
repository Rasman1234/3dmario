# Design Simulation Engine

**Subsystem:** GDIL §9  
**Purpose:** Predict design outcomes **before implementation** — fun, frustration, learning curve, difficulty, reward pacing, exploration

---

## 1. Simulation Inputs

| Input Source | Data |
|--------------|------|
| Mechanic MKB | Difficulty, telemetry hooks, tutorial strategy |
| Level grammar tags | TEACH/PRACTICE/TWIST/EXAM/REWARD/RECOVER sequence |
| Interaction Matrix | Edge case density, validation status |
| World Identity | Identity vector, emotional tone |
| Boss Intelligence | Phase count, recovery windows |
| Fun Engine | Driver weights, target bands |
| Historical playtest | Calibration data from similar segments |

---

## 2. Simulation Outputs

| Output | Description | Range |
|--------|-------------|-------|
| **Predicted Fun** | Composite score | 0–100 |
| **Predicted Frustration** | Frustration index estimate | 0–1 |
| **Learning curve** | Time-to-competence estimate | minutes |
| **Difficulty profile** | Per-segment difficulty array | 0–1 per segment |
| **Reward pacing** | Rewards/minute curve | timeline |
| **Exploration uptake** | Predicted exploration index | 0–1 |
| **Emotional curve** | Predicted arousal/valence timeline | chart |
| **Risks** | Ranked risk list | P0–P2 |
| **Confidence** | Model confidence | 0–1 |

---

## 3. Simulation Methods (Tiered)

| Tier | Method | When | Confidence |
|------|--------|------|------------|
| **S1 Heuristic** | Grammar rules + Fun Engine formulas | Idea, Prototype | 0.4–0.6 |
| **S2 Historical** | Compare to similar validated segments | Experiment | 0.5–0.7 |
| **S3 Bot proxy** | T0–T2 bot runs on blockout | Internal playtest prep | 0.6–0.8 |
| **S4 Calibrated** | Bot + playtest regression model | Approval, ship | 0.75–0.9 |

**Rule:** GDIL authorization requires ≥S2 for mechanics, ≥S3 for levels, ≥S3 for bosses.

---

## 4. Risk Prediction

| Risk Type | Heuristic Trigger | Predicted If |
|-----------|-------------------|--------------|
| Frustration spiral | EXAM without RECOVER | Frustration >0.4 |
| Trivial segment | PRACTICE only, no TWIST | Fun <45 |
| Reward desert | >90s no reward tag | Reward driver <0.3 |
| Exploration collapse | Linear grammar only | Exploration <0.2 |
| Boss attrition | Recovery window <1.5s | Boss deaths >4 avg |
| Learning failure | TEACH deaths >0 predicted | Learning curve >10 min |

Each risk includes **confidence** and **mitigation suggestion**.

---

## 5. Simulation Report Template

`simulation/reports/SIM-{target}-{date}.md`

```yaml
target: MKB-M4 / LEVEL-grassland_01 / BOSS-W1-finale
tier: S3
predicted_fun: 62
predicted_frustration: 0.22
learning_curve_min: 4
confidence: 0.72
risks:
  - id: R-SIM-01
    priority: P1
    description: "TWIST segment difficulty 0.78 exceeds band"
    mitigation: "Add PRACTICE platform before TWIST"
recommendation: proceed | proceed_with_changes | block
```

---

## 6. Calibration Loop

```
Predict → Implement → Playtest → Compare predicted vs actual → Adjust model weights
```

| Metric | Calibration Target |
|--------|-------------------|
| Fun prediction error | ±10 pts at S4 |
| Frustration prediction error | ±0.1 at S4 |
| Risk true-positive rate | ≥70% |

Calibration data stored in `simulation/calibration/`.

---

## 7. Integration

| Stage | Simulation Required |
|-------|---------------------|
| Mechanic Experiment → Playtest | S1 minimum |
| Mechanic Approval | S2 |
| Level blockout → playtest | S3 |
| Boss → level integration | S3 |
| World ship gate | S4 on representative sample |

## 8. Dashboard

| Widget | Content |
|--------|---------|
| Pending simulations | Queue |
| Prediction vs actual | Scatter plot (calibration) |
| Blocked designs | Simulation `block` count |
| Model confidence trend | Weekly |
